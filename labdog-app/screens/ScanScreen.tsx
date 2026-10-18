import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DocumentScanner, { ResponseType } from 'react-native-document-scanner-plugin';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { styles } from '../styles/ScanStyle';
import { API_URL } from '../config';

const ANALYZE_URL = `${API_URL}/analyze`;
const MAX_PAGES = 10;
const TIMEOUT_MS = 120000; // time for render server to spin up (2x bc of multiple model calls)
const SLOW_HINT_MS = 8000;
const QUALITY_CODES = ['blank', 'dark', 'blurry', 'small'];
const FLAG_LABEL = { high: 'High', low: 'Low', normal: 'In range', unknown: 'Unclear' };

interface Page {
  uri: string;
  base64: string;
}
interface PageProblem {
  page: number;
  code: string;
  error: string;
}
interface Marker {
  name: string; value: string; unit: string; ref_range: string;
  flag: 'low' | 'normal' | 'high' | 'unknown';
}
interface AnalyzeResponse {
  summary?: string;
  problems?: PageProblem[];
  error?: string;
  code?: string;
  title?: string;
  markers?: Marker[];
  key_insights?: string[];
  doctor_questions?: string[];
  disclaimer?: string
}

type Outcome =
  | { ok: true; data: AnalyzeResponse }
  | { ok: false; message: string; code?: string };

// gives error msg for user
async function callAnalyze(images: string[], skipQualityCheck: boolean): Promise<Outcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(ANALYZE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images, skipQualityCheck }),
      signal: controller.signal,
    });

    let data: AnalyzeResponse = {};
    try {
      data = await response.json();
    } catch {
    }

    if (!response.ok) {
      const fallback =
        response.status >= 500
          ? 'The server is busy or waking up. Wait a few seconds and try again.'
          : 'Something went wrong. Please try again.';
      return { ok: false, message: data.error ?? fallback, code: data.code };
    }
    if (!data.summary) {
      return { ok: false, message: 'No text came back. Please try again.' };
    }
    return { ok: true, data };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      message: timedOut
        ? 'This is taking too long. Please try again in a minute.'
        : "Couldn't reach the server. Check your connection and try again.",
    };
  } finally {
    clearTimeout(timer);
  }
}

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

export default function ScanScreen({ navigation }: Props): React.JSX.Element {
  const [pages, setPages] = useState<Page[]>([]);
  const [selected, setSelected] = useState<number>(0);
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [notice, setNotice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [slowHint, setSlowHint] = useState<boolean>(false);

  const requestPermissions = async (type: 'camera' | 'library'): Promise<boolean> => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const addPages = (incoming: Page[]): void => {
    const room = MAX_PAGES - pages.length;
    if (incoming.length > room) {
      Alert.alert('Page limit', `You can add up to ${MAX_PAGES} pages. The extra pages were left out.`);
    }
    const next = incoming.slice(0, room);
    if (next.length === 0) return;
    setSelected(pages.length);
    setPages((p) => [...p, ...next]);
    setResult(null);
    setNotice('');
  };

  const removePage = (index: number): void => {
    setPages((p) => p.filter((_, i) => i !== index));
    setSelected((s) => Math.max(0, Math.min(s, pages.length - 2)));
    setResult(null);
    setNotice('');
  };

  const clearPages = (): void => {
    setPages([]);
    setSelected(0);
    setResult(null);
    setNotice('');
  };

  const scanDocument = async (): Promise<void> => {
    if (pages.length >= MAX_PAGES) {
      Alert.alert('Page limit', `You can add up to ${MAX_PAGES} pages.`);
      return;
    }
    const ok = await requestPermissions('camera');
    if (!ok) {
      Alert.alert('Permission needed', 'Camera access is required to scan a document.');
      return;
    }
    try {
      const { scannedImages, status } = await DocumentScanner.scanDocument({
        maxNumDocuments: MAX_PAGES - pages.length, // android only thing
        croppedImageQuality: 70,
        responseType: ResponseType.Base64,
      });
      if (status !== 'success' || !scannedImages || scannedImages.length === 0) return;
      addPages(
        scannedImages.map((b64) => ({ uri: `data:image/jpeg;base64,${b64}`, base64: b64 }))
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Scanner problem', "The scanner couldn't start. Please try again.");
    }
  };

  const pickFromLibrary = async (): Promise<void> => {
    if (pages.length >= MAX_PAGES) {
      Alert.alert('Page limit', `You can add up to ${MAX_PAGES} pages.`);
      return;
    }
    const ok = await requestPermissions('library');
    if (!ok) {
      Alert.alert('Permission needed', 'Photo library access is required to upload photos.');
      return;
    }
    try {
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: MAX_PAGES - pages.length,
        orderedSelection: true, // ios has numbered pages for ordering
        base64: true,
        quality: 0.7,
      });
      if (picked.canceled || !picked.assets) return;
      addPages(
        picked.assets.flatMap((a) => (a.base64 ? [{ uri: a.uri, base64: a.base64 }] : []))
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Photo problem', "Those photos couldn't be loaded. Please try again.");
    }
  };

  const analyze = async (skipQualityCheck = false): Promise<void> => {
    if (pages.length === 0) {
      Alert.alert('No pages yet', 'Scan or upload at least one page first.');
      return;
    }
    setLoading(true);
    setResult(null);
    setNotice('');
    const slowTimer = setTimeout(() => setSlowHint(true), SLOW_HINT_MS);

    const outcome = await callAnalyze(
      pages.map((p) => p.base64),
      skipQualityCheck
    );

    clearTimeout(slowTimer);
    setSlowHint(false);
    setLoading(false);

    if (outcome.ok) {
      setResult(outcome.data);
      const skipped = outcome.data.problems ?? [];
      if (skipped.length > 0) {
        const which =
          skipped.length === 1
            ? `Page ${skipped[0].page} was`
            : `Pages ${skipped.map((p) => p.page).join(', ')} were`;
        setNotice(`${which} skipped, so this result is incomplete. Remove or retake them and scan again.`);
      }
      return;
    }

    // retry with bad photo quality stuff
    if (outcome.code && QUALITY_CODES.includes(outcome.code)) {
      Alert.alert("Let's try that again", outcome.message, [
        { text: 'Retake', style: 'cancel' },
        { text: 'Use anyway', onPress: () => analyze(true) },
      ]);
      return;
    }
    Alert.alert("Couldn't read the scan", outcome.message);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>‹ Library</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.scroll}>

        <Text style={styles.title}>Lab Scan Upload</Text>

        <View style={styles.imageBox}>
          {pages[selected] ? (
            <Image source={{ uri: pages[selected].uri }} style={styles.image} />
          ) : (
            <Text style={styles.placeholder}>No pages yet</Text>
          )}
        </View>

        {pages.length > 0 && (
          <View style={styles.stripWrap}>
            <View style={styles.stripHeader}>
              <Text style={styles.pageCount}>
                {pages.length} {pages.length === 1 ? 'page' : 'pages'} (click to preview)
              </Text>
              <TouchableOpacity onPress={clearPages}>
                <Text style={styles.clearLink}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {pages.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.thumb, i === selected && styles.thumbActive]}
                  onPress={() => setSelected(i)}
                >
                  <Image source={{ uri: p.uri }} style={styles.thumbImage} />
                  <TouchableOpacity
                    style={styles.thumbRemove}
                    onPress={() => removePage(i)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={`Remove page ${i + 1}`}
                  >
                    <Text style={styles.thumbRemoveText}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={scanDocument} disabled={loading}>
            <Text style={styles.buttonText}>Scan Pages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={pickFromLibrary} disabled={loading}>
            <Text style={styles.buttonText}>Upload Photos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, pages.length === 0 && styles.buttonDisabled]}
          onPress={() => analyze()}
          disabled={pages.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Summarize</Text>
          )}
        </TouchableOpacity>

        {loading && slowHint ? (
          <Text style={styles.hint}>
            Still working. The server might be waking up, which can take up to a minute the first time.
          </Text>
        ) : null}

        {notice ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}

        {result ? (
          <View style={styles.summaryBox}>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Text style={styles.summaryText}>{result.summary}</Text>
            
            <View style={styles.markerList}>
              {(result.markers ?? []).map((m, i) => (
                <View key={i} style={styles.markerRow}>
                  <View style={styles.markerMain}>
                    <Text style={styles.markerName}>{m.name}</Text>
                    <Text style={styles.markerMeta}>
                      {m.value || '—'} {m.unit}{m.ref_range ? ` - range ${m.ref_range}` : ''}
                    </Text>
                  </View>
                  <View style={[styles.flagPill, styles[`flag_${m.flag}` as const]]}>
                    <Text style={styles.flagText}>{FLAG_LABEL[m.flag]}</Text>
                  </View>
                </View>
              ))}
            </View>

            {(result.key_insights ?? []).length > 0 && <Text style={styles.sectionLabel}>What stands out:</Text>}
            {(result.key_insights ?? []).map((t, i) => <Text key={i} style={styles.summaryText}>-{t}</Text>)}

            {(result.doctor_questions ?? []).length > 0 && <Text style={styles.sectionLabel}>Questions for your doctor:</Text>}
            {(result.doctor_questions ?? []).map((t, i) => <Text key={i} style={styles.summaryText}>- {t}</Text>)}

            <Text style={styles.disclaimer}>{result.disclaimer}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}