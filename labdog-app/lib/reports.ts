import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

// what /analyze returns
export interface AnalyzedMarker {
  name: string;
  name_key: string;
  value: string;
  value_num: number | null;
  unit: string;
  ref_range: string;
  flag: 'low' | 'normal' | 'high' | 'unknown';
  position: number;
}

export interface AnalyzedReport {
  title: string;
  report_date: string | null;
  summary: string;
  key_insights: string[];
  doctor_questions: string[];
  markers: AnalyzedMarker[];
}

export interface ReportRow {
  id: string;
  title: string;
  report_date: string | null;
  created_at: string;
  image_paths: string[];
}

export interface ReportCard {
  id: string;
  title: string;
  date: string;
  thumbnailUri?: string;
}

const BUCKET = 'reports';

// saves one scanned report (row -> page images -> markers)
// if smth fails the last step undos so that the app doesn't crash when doing all of this
export async function saveReport(
  userId: string,
  analysis: AnalyzedReport,
  pagesBase64: string[],
): Promise<string> {
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .insert({
      title: analysis.title,
      report_date: analysis.report_date,
      summary: analysis.summary,
      key_insights: analysis.key_insights,
      doctor_questions: analysis.doctor_questions,
    })
    .select('id')
    .single();
  if (reportError || !report) throw new Error('Could not save the report.');

  const paths: string[] = [];
  try {
    for (let i = 0; i < pagesBase64.length; i++) {
      const path = `${userId}/${report.id}/page-${i + 1}.jpg`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, decode(pagesBase64[i]), { contentType: 'image/jpeg' });
      if (error) throw error;
      paths.push(path);
    }

    const { error: pathError } = await supabase
      .from('reports')
      .update({ image_paths: paths })
      .eq('id', report.id);
    if (pathError) throw pathError;

    if (analysis.markers.length > 0) {
      const { error: markerError } = await supabase.from('report_markers').insert(
        analysis.markers.map((m) => ({
          report_id: report.id,
          name: m.name,
          name_key: m.name_key,
          value: m.value,
          value_num: m.value_num,
          unit: m.unit,
          ref_range: m.ref_range,
          flag: m.flag,
          position: m.position,
          report_date: analysis.report_date,
        })),
      );
      if (markerError) throw markerError;
    }
  } catch {
    if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
    await supabase.from('reports').delete().eq('id', report.id);
    throw new Error('Could not save the report.');
  }

  return report.id;
}

function formatDate(iso: string): string {
  // date format parsing bc that's a lil tough sometimes bc of varies formats
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

// orders library from newest to oldest reports
export async function listReports(): Promise<ReportCard[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('id, title, report_date, created_at, image_paths')
    .order('report_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .returns<ReportRow[]>();
  if (error) throw new Error('Could not load your reports.');

  const firstPages = data.map((r) => r.image_paths[0]).filter(Boolean);
  const urlByPath = new Map<string, string>();
  if (firstPages.length > 0) {
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(firstPages, 3600);
    signed?.forEach((s) => {
      if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
    });
  }

  return data.map((r) => ({
    id: r.id,
    title: r.title,
    date: formatDate(r.report_date ?? r.created_at),
    thumbnailUri: r.image_paths[0] ? urlByPath.get(r.image_paths[0]) : undefined,
  }));
}

export interface HistoryPoint {
  report_id: string;
  report_date: string;
  value_num: number;
  unit: string | null;
  flag: string;
}

// all of the saved values for that specific marker in a historian func so that i can call it later
// for the history button on the marker thingy
export async function getMarkerHistory(nameKey: string): Promise<HistoryPoint[]> {
  const { data, error } = await supabase
    .from('report_markers')
    .select('report_id, report_date, value_num, unit, flag')
    .eq('name_key', nameKey)
    .not('value_num', 'is', null)
    .not('report_date', 'is', null)
    .order('report_date', { ascending: true })
    .returns<HistoryPoint[]>();
  if (error) throw new Error('Could not load the history.');
  return data;
}

export async function deleteReport(reportId: string): Promise<void> {
  const { data: row } = await supabase
    .from('reports')
    .select('image_paths')
    .eq('id', reportId)
    .single<{ image_paths: string[] | null }>();

  const paths = row?.image_paths ?? [];
  if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);

  await supabase.from('report_markers').delete().eq('report_id', reportId);

  const { error } = await supabase.from('reports').delete().eq('id', reportId);
  if (error) throw new Error('Could not delete that report.');
}