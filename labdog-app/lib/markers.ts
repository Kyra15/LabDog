// currently using sample stuff bc no time sigh

export type Flag = 'low' | 'normal' | 'high' | 'unknown';

export interface Range {
  low: number | null;
  high: number | null;
}

export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export interface Definition {
  name: string;
  about: string;
  group: string;
}

export const DEFINITIONS: Record<string, Definition> = {
  wbc: { name: 'White Blood Cells', group: 'Blood count', about: 'White blood cells are part of your immune system and help fight infections. The count can go up or down for many reasons, like a recent cold, stress, or some medicines.' },
  rbc: { name: 'Red Blood Cells', group: 'Blood count', about: 'Red blood cells carry oxygen from your lungs to the rest of your body. This counts how many you have in a small amount of blood.' },
  hemoglobin: { name: 'Hemoglobin', group: 'Blood count', about: 'Hemoglobin is the protein inside red blood cells that holds oxygen. It is one of the main numbers doctors look at to see how well your blood carries oxygen.' },
  hematocrit: { name: 'Hematocrit', group: 'Blood count', about: 'Hematocrit is the share of your blood made up of red blood cells, shown as a percentage. It usually moves together with hemoglobin.' },
  mcv: { name: 'MCV', group: 'Blood count', about: 'MCV is the average size of your red blood cells. Cells that are smaller or bigger than usual can give your doctor clues about what is going on.' },
  mch: { name: 'MCH', group: 'Blood count', about: 'MCH is the average amount of hemoglobin inside each red blood cell.' },
  mchc: { name: 'MCHC', group: 'Blood count', about: 'MCHC is how concentrated the hemoglobin is inside your red blood cells.' },
  rdw: { name: 'RDW', group: 'Blood count', about: 'RDW shows how much your red blood cells vary in size. A higher number means the sizes are more mixed.' },
  platelets: { name: 'Platelets', group: 'Blood count', about: 'Platelets are tiny cells that help your blood clot when you get a cut.' },
  neutrophils: { name: 'Neutrophils', group: 'Blood count', about: 'Neutrophils are the most common type of white blood cell. They are usually the first to respond to bacteria.' },
  lymphocytes: { name: 'Lymphocytes', group: 'Blood count', about: 'Lymphocytes are white blood cells that help fight viruses and make antibodies.' },
  monocytes: { name: 'Monocytes', group: 'Blood count', about: 'Monocytes are white blood cells that help clean up germs and damaged cells.' },
  eosinophils: { name: 'Eosinophils', group: 'Blood count', about: 'Eosinophils are white blood cells involved in allergies and fighting some parasites.' },
  basophils: { name: 'Basophils', group: 'Blood count', about: 'Basophils are the least common white blood cell. They play a part in allergic reactions.' },
  ferritin: { name: 'Ferritin', group: 'Iron', about: 'Ferritin is a protein that stores iron. It gives a picture of how much iron your body has saved up.' },
  iron: { name: 'Iron', group: 'Iron', about: 'This measures the iron moving through your blood right now. It can change during the day and after meals.' },
  tibc: { name: 'TIBC', group: 'Iron', about: 'TIBC (total iron binding capacity) shows how much iron your blood is able to carry.' },
  tsat: { name: 'Transferrin Saturation', group: 'Iron', about: 'This is the percentage of your iron carriers that are actually holding iron.' },
  cholesterol_total: { name: 'Total Cholesterol', group: 'Cholesterol', about: 'Total cholesterol adds up the different kinds of cholesterol in your blood. Your body needs some cholesterol to build cells.' },
  ldl: { name: 'LDL Cholesterol', group: 'Cholesterol', about: 'LDL is often called "bad" cholesterol because higher amounts can build up in blood vessels over time.' },
  hdl: { name: 'HDL Cholesterol', group: 'Cholesterol', about: 'HDL is often called "good" cholesterol because it helps carry extra cholesterol away to the liver. For HDL, higher is usually better.' },
  triglycerides: { name: 'Triglycerides', group: 'Cholesterol', about: 'Triglycerides are a type of fat in your blood that stores extra energy. They can change a lot depending on what you ate recently.' },
  non_hdl: { name: 'Non-HDL Cholesterol', group: 'Cholesterol', about: 'Non-HDL is your total cholesterol minus HDL. It includes all the types that can build up in blood vessels.' },
  vldl: { name: 'VLDL Cholesterol', group: 'Cholesterol', about: 'VLDL carries triglycerides through your blood. It is usually estimated from your triglyceride number.' },
  glucose: { name: 'Glucose', group: 'Blood sugar', about: 'Glucose is the sugar in your blood and your body\'s main energy source. Whether you ate before the test makes a big difference.' },
  a1c: { name: 'Hemoglobin A1c', group: 'Blood sugar', about: 'A1c shows your average blood sugar over the past 2 to 3 months, so it is less affected by one meal than a glucose test.' },
  bun: { name: 'BUN', group: 'Kidneys', about: 'BUN (blood urea nitrogen) is a waste product your kidneys filter out. It can also change with how much protein you eat and how hydrated you are.' },
  creatinine: { name: 'Creatinine', group: 'Kidneys', about: 'Creatinine is a waste product from your muscles that your kidneys clear from the blood. It is one way to check how well the kidneys are filtering.' },
  egfr: { name: 'eGFR', group: 'Kidneys', about: 'eGFR estimates how well your kidneys filter your blood. It is calculated from creatinine, age, and other factors. For eGFR, higher is usually better.' },
  bun_creatinine_ratio: { name: 'BUN/Creatinine Ratio', group: 'Kidneys', about: 'This compares your BUN and creatinine numbers. Doctors look at it together with the two numbers on their own.' },
  sodium: { name: 'Sodium', group: 'Electrolytes', about: 'Sodium is a salt that helps control the water balance in your body and helps your nerves and muscles work.' },
  potassium: { name: 'Potassium', group: 'Electrolytes', about: 'Potassium helps your heart, nerves, and muscles work properly.' },
  chloride: { name: 'Chloride', group: 'Electrolytes', about: 'Chloride works with sodium to keep your body\'s fluids balanced.' },
  co2: { name: 'CO2 (Bicarbonate)', group: 'Electrolytes', about: 'This measures bicarbonate, which helps keep your blood from getting too acidic or too basic.' },
  calcium: { name: 'Calcium', group: 'Electrolytes', about: 'Calcium is important for bones, muscles, nerves, and your heartbeat.' },
  protein_total: { name: 'Total Protein', group: 'Liver', about: 'Total protein measures the proteins in your blood, mainly albumin and globulin.' },
  albumin: { name: 'Albumin', group: 'Liver', about: 'Albumin is a protein made by the liver. It helps keep fluid in your blood vessels and carries things around the body.' },
  globulin: { name: 'Globulin', group: 'Liver', about: 'Globulins are a group of proteins that include many antibodies.' },
  bilirubin_total: { name: 'Total Bilirubin', group: 'Liver', about: 'Bilirubin is a yellow substance made when old red blood cells break down. The liver clears it from the body.' },
  alp: { name: 'Alkaline Phosphatase', group: 'Liver', about: 'ALP is an enzyme found mostly in the liver and bones.' },
  alt: { name: 'ALT', group: 'Liver', about: 'ALT is an enzyme found mostly in the liver. Exercise, some medicines, and other things can also change it.' },
  ast: { name: 'AST', group: 'Liver', about: 'AST is an enzyme found in the liver and also in muscles and the heart.' },
  ggt: { name: 'GGT', group: 'Liver', about: 'GGT is an enzyme found mostly in the liver. Doctors often look at it alongside ALP.' },
  tsh: { name: 'TSH', group: 'Thyroid', about: 'TSH is a signal from your brain that tells your thyroid how much hormone to make. It often moves in the opposite direction from thyroid hormone levels.' },
  free_t4: { name: 'Free T4', group: 'Thyroid', about: 'Free T4 is the main hormone made by your thyroid, which helps control your energy and metabolism.' },
  free_t3: { name: 'Free T3', group: 'Thyroid', about: 'Free T3 is the active form of thyroid hormone.' },
  vitamin_d: { name: 'Vitamin D', group: 'Vitamins', about: 'Vitamin D helps your body absorb calcium and keep bones strong. Your body makes it from sunlight, and you also get it from some foods.' },
  b12: { name: 'Vitamin B12', group: 'Vitamins', about: 'Vitamin B12 helps your body make red blood cells and keeps your nerves healthy.' },
  urine_sg: { name: 'Urine Specific Gravity', group: 'Urine', about: 'This shows how concentrated your urine is, which mostly reflects how much water you have been drinking.' },
  urine_ph: { name: 'Urine pH', group: 'Urine', about: 'This shows how acidic your urine is. Diet can change it a lot.' },
};

export const GENERIC_ABOUT =
  "We don't have a plain-language description for this test yet. Your doctor can explain what it measures and what your result means for you.";

export interface Reading {
  reportId: string;
  reportTitle: string;
  date: string;
  value: string;
  num: number | null;
  unit: string;
  refRange: string;
  range: Range | null;
  flag: Flag;
}

export interface MarkerSeries {
  key: string;
  name: string;
  group: string;
  about: string;
  readings: Reading[];
  latest: Reading;
  previous: Reading | null;
  chartable: Reading[];
}


const REPORTS = {
  cbcJun: { id: 'r1', title: 'CBC with Differential', date: '2026-06-02' },
  cmpJun: { id: 'r2', title: 'Comprehensive Metabolic Panel', date: '2026-06-02' },
  lipidJul: { id: 'r3', title: 'Lipid Panel', date: '2026-07-30' },
  cbcAug: { id: 'r4', title: 'CBC with Differential', date: '2026-08-18' },
  ironAug: { id: 'r5', title: 'Iron Panel', date: '2026-08-18' },
  thyroidSep: { id: 'r6', title: 'Thyroid Panel', date: '2026-09-21' },
  cbcOct: { id: 'r7', title: 'CBC with Differential', date: '2026-10-10' },
  lipidOct: { id: 'r8', title: 'Lipid Panel', date: '2026-10-10' },
  uaOct: { id: 'r9', title: 'Urinalysis', date: '2026-10-10' },
};
type ReportKey = keyof typeof REPORTS;

// [report, value, unit, printed range, flag]
type Row = [ReportKey, string, string, string, Flag];

const SAMPLE: Record<string, Row[]> = {
  hemoglobin: [
    ['cbcJun', '12.4', 'g/dL', '12.0-15.5', 'normal'],
    ['cbcAug', '10.9', 'g/dL', '12.0-15.5', 'low'],
    ['cbcOct', '11.6', 'g/dL', '12.0-15.5', 'low'],
  ],
  ferritin: [['ironAug', '8', 'ng/mL', '15-150', 'low']],
  ldl: [
    ['lipidJul', '162', 'mg/dL', '<100', 'high'],
    ['lipidOct', '141', 'mg/dL', '<100', 'high'],
  ],
  hdl: [
    ['lipidJul', '48', 'mg/dL', '>39', 'normal'],
    ['lipidOct', '52', 'mg/dL', '>39', 'normal'],
  ],
  wbc: [
    ['cbcJun', '6.1', 'x10^3/uL', '4.0-11.0', 'normal'],
    ['cbcAug', '7.4', 'x10^3/uL', '4.0-11.0', 'normal'],
    ['cbcOct', '6.8', 'x10^3/uL', '4.0-11.0', 'normal'],
  ],
  platelets: [
    ['cbcJun', '265', 'x10^3/uL', '150-400', 'normal'],
    ['cbcAug', '310', 'x10^3/uL', '150-400', 'normal'],
    ['cbcOct', '288', 'x10^3/uL', '150-400', 'normal'],
  ],
  glucose: [['cmpJun', '94', 'mg/dL', '70-99', 'normal']],
  tsh: [['thyroidSep', '2.1', 'uIU/mL', '0.45-4.50', 'normal']],
  urine_nitrite: [['uaOct', 'Negative', '', 'Negative', 'normal']],
};

const NAMES: Record<string, string> = { urine_nitrite: 'Urine Nitrite' };

function toRange(printed: string): Range | null {
  const between = /^([\d.]+)-([\d.]+)$/.exec(printed);
  if (between) return { low: Number(between[1]), high: Number(between[2]) };
  const under = /^<([\d.]+)$/.exec(printed);
  if (under) return { low: null, high: Number(under[1]) };
  const over = /^>([\d.]+)$/.exec(printed);
  if (over) return { low: Number(over[1]), high: null };
  return null;
}

// short names / spellings that don't match a definition name exactly
const ALIASES: Record<string, string> = {
  hgb: 'hemoglobin', hb: 'hemoglobin', hct: 'hematocrit', plt: 'platelets',
  'wbc count': 'wbc', 'white blood cell count': 'wbc', 'rbc count': 'rbc', 'platelet count': 'platelets',
  'ldl c': 'ldl', 'ldl chol calc': 'ldl', 'hdl c': 'hdl', 'cholesterol total': 'cholesterol_total',
  'glucose fasting': 'glucose', 'fasting glucose': 'glucose', 'ferritin serum': 'ferritin',
  'hemoglobin a1c': 'a1c', hba1c: 'a1c', 'alt sgpt': 'alt', 'ast sgot': 'ast', 't4 free': 'free_t4',
  nitrite: 'urine_nitrite', 'urine nitrite': 'urine_nitrite',
};

const clean = (s: string): string =>
  s.toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

// finds which marker a scanned name is, so we can show its definition and sample history
function findKey(name: string): string | null {
  const n = clean(name);
  if (ALIASES[n]) return ALIASES[n];
  for (const [key, def] of Object.entries(DEFINITIONS)) {
    if (n === key.replace(/_/g, ' ') || n === clean(def.name)) return key;
  }
  return SAMPLE[n.replace(/ /g, '_')] ? n.replace(/ /g, '_') : null;
}

function sampleReading([rk, value, unit, refRange, flag]: Row): Reading {
  const r = REPORTS[rk];
  const n = Number(value);
  return {
    reportId: r.id,
    reportTitle: r.title,
    date: r.date,
    value,
    num: value.trim() !== '' && Number.isFinite(n) ? n : null,
    unit,
    refRange,
    range: toRange(refRange),
    flag,
  };
}

function todayIso(): string {
  const d = new Date();
  const pad = (x: number): string => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const sameUnit = (a: string, b: string): boolean =>
  a.replace(/\s+/g, '').toLowerCase() === b.replace(/\s+/g, '').toLowerCase();

// what the scan results pass in when a marker row is tapped
export interface TappedMarker {
  name: string;
  value?: string;
  unit?: string;
  refRange?: string;
  flag?: Flag;
}

export const THIS_SCAN = 'This scan';

const wait = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));

// builds the stats page data: sample history (if we have some for this marker) + the tapped result
export async function loadMarker(tapped: TappedMarker): Promise<MarkerSeries | null> {
  await wait(300);
  const key = findKey(tapped.name);
  const readings: Reading[] = (key && SAMPLE[key] ? SAMPLE[key] : []).map(sampleReading);

  if (tapped.value) {
    const n = Number((tapped.value ?? '').replace(/,/g, ''));
    readings.push({
      reportId: 'scan',
      reportTitle: THIS_SCAN,
      date: todayIso(),
      value: tapped.value,
      num: Number.isFinite(n) ? n : null,
      unit: tapped.unit ?? '',
      refRange: tapped.refRange ?? '',
      range: toRange((tapped.refRange ?? '').replace(/\s+/g, '')),
      flag: tapped.flag ?? 'unknown',
    });
  }
  if (readings.length === 0) return null;

  const latest = readings[readings.length - 1];
  const chartable = readings.filter((r) => r.num !== null && sameUnit(r.unit, latest.unit));
  const earlier = chartable.filter((r) => r !== latest);
  const def = key ? DEFINITIONS[key] : undefined;
  return {
    key: key ?? clean(tapped.name).replace(/ /g, '_'),
    name: def?.name ?? (key ? NAMES[key] : undefined) ?? tapped.name,
    group: def?.group ?? (key === 'urine_nitrite' ? 'Urine' : 'Lab result'),
    about: def?.about ?? GENERIC_ABOUT,
    readings,
    latest,
    previous: latest.num !== null && earlier.length > 0 ? earlier[earlier.length - 1] : null,
    chartable,
  };
}