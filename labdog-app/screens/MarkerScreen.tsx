import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { styles } from '../styles/TrendStyle';
import MarkerChart, { flagColor } from '../components/MarkerChart';
import FlagPill from '../components/FlagPill';
import { formatShortDate, loadMarker, THIS_SCAN, type MarkerSeries } from '../lib/markers';

type Props = NativeStackScreenProps<RootStackParamList, 'Marker'>;

const round = (n: number): string => Number(n.toFixed(2)).toString();


export default function MarkerScreen({ navigation, route }: Props): React.JSX.Element {
  const tapped = route.params;
  const [series, setSeries] = useState<MarkerSeries | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      loadMarker(tapped)
        .then((s) => {
          setSeries(s);
          setError(s ? '' : 'No results found for this marker.');
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'Could not load this marker.'))
        .finally(() => setLoading(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tapped.name, tapped.value]),
  );

  const header = (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()} hitSlop={8}>
        <Ionicons name="chevron-back" size={20} color={colors.white} />
        <Text style={styles.backLinkText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading || !series) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {header}
        <View style={[styles.body, styles.emptyState]}>
          {loading ? <ActivityIndicator color={colors.navy} /> : <Text style={styles.errorText}>{error}</Text>}
        </View>
      </SafeAreaView>
    );
  }

  const { latest, previous, chartable } = series;
  const diff = previous && latest.num !== null && previous.num !== null ? latest.num - previous.num : null;
  const skipped = series.readings.length - chartable.length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {header}
      <ScrollView style={styles.body} contentContainerStyle={styles.scroll}>
        <Text style={styles.groupLabel}>{series.group}</Text>
        <Text style={styles.title}>{series.name}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{latest.reportTitle === THIS_SCAN ? 'This result' : 'Latest result'}</Text>
          <View style={styles.latestRow}>
            <Text style={styles.latestValue}>{latest.value || '—'}</Text>
            <Text style={styles.latestUnit}>{latest.unit}</Text>
          </View>
          <View style={styles.latestMeta}>
            <FlagPill flag={latest.flag} />
            <Text style={styles.metaText}>{formatShortDate(latest.date)}</Text>
          </View>
          {latest.refRange !== '' && (
            <Text style={[styles.metaText, { marginTop: 8 }]}>
              Reference range: {latest.refRange} {latest.refRange.includes(latest.unit) ? '' : latest.unit}
            </Text>
          )}
          {diff !== null && previous && (
            <Text style={styles.change}>
              {diff === 0
                ? `No change since ${formatShortDate(previous.date)}`
                : `${diff > 0 ? '▲ Up' : '▼ Down'} ${round(Math.abs(diff))} ${latest.unit} since ${formatShortDate(previous.date)}`}
            </Text>
          )}
        </View>

        {/* history chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>History</Text>
          {chartable.length > 0 ? (
            <>
              <MarkerChart
                range={latest.range}
                points={chartable.map((r) => ({ date: r.date, value: r.num as number, flag: r.flag }))}
              />
              <View style={styles.legend}>
                {latest.range && (
                  <View style={styles.legendItem}>
                    <View style={styles.legendBand} />
                    <Text style={styles.legendText}>Reference range</Text>
                  </View>
                )}
                <View style={styles.legendItem}>
                  <View style={[styles.legendSwatch, { backgroundColor: flagColor('normal') }]} />
                  <Text style={styles.legendText}>In range</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendSwatch, { backgroundColor: flagColor('high') }]} />
                  <Text style={styles.legendText}>Outside range</Text>
                </View>
              </View>
              {chartable.length === 1 && (
                <Text style={styles.chartNote}>Scan another report with this test to see how it changes over time.</Text>
              )}
              {skipped > 0 && (
                <Text style={styles.chartNote}>
                  {skipped} {skipped === 1 ? 'result is' : 'results are'} listed below but not charted (different unit
                  or not a number).
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.chartNote}>This result isn't a number, so there's nothing to chart. See the list below.</Text>
          )}
        </View>

        {/* definition */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What it measures</Text>
          <Text style={styles.about}>{series.about}</Text>
        </View>

        {/* every reading, newest first */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>All results</Text>
          {[...series.readings].reverse().map((r, i) => (
            <View key={`${r.reportId}-${i}`} style={[styles.readingRow, i === 0 && styles.readingRowFirst]}>
              <View style={styles.readingLeft}>
                <Text style={styles.readingDate}>{formatShortDate(r.date)}</Text>
                <Text style={styles.readingReport} numberOfLines={1}>
                  {r.reportTitle}
                </Text>
              </View>
              <View style={styles.readingRight}>
                <Text style={styles.readingValue}>
                  {r.value || '—'} {r.unit}
                </Text>
                <FlagPill flag={r.flag} />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          LabDog explains lab results in plain language. It is not a diagnosis. Ranges can differ between labs, so talk
          to your doctor about your results.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}