import React, { useCallback, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, type CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme';
import { styles } from '../styles/TrendStyle';
import MarkerChart from '../components/MarkerChart';
import FlagPill from '../components/FlagPill';
import { formatShortDate, loadMarkerSeries, type MarkerSeries } from '../lib/markers';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Trends'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function TrendsScreen({ navigation }: Props): React.JSX.Element {
  const [series, setSeries] = useState<MarkerSeries[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const load = useCallback(async (): Promise<void> => {
    try {
      setSeries(await loadMarkerSeries());
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your results.');
    }
  }, []);

  // reload every time the tab opens
  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const attention = series.filter((s) => s.latest.flag === 'high' || s.latest.flag === 'low');
  const rest = series.filter((s) => !attention.includes(s));
  const sections = [
    ...(attention.length ? [{ title: 'Outside the range', data: attention }] : []),
    ...(rest.length ? [{ title: attention.length ? 'Everything else' : 'Your markers', data: rest }] : []),
  ];

  const renderRow = ({ item }: { item: MarkerSeries }): React.JSX.Element => {
    const { latest } = item;
    const count = item.readings.length;
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Marker', { key: item.key, name: item.name })}
      >
        <View style={styles.rowMain}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.rowValueLine}>
            <Text style={styles.rowValue}>
              {latest.value || '—'} {latest.unit}
            </Text>
            <FlagPill flag={latest.flag} />
          </View>
          <Text style={styles.rowMeta}>
            {count} {count === 1 ? 'result' : 'results'} · last {formatShortDate(latest.date)}
          </Text>
        </View>
        {item.chartable.length > 1 && (
          <View style={styles.spark}>
            <MarkerChart
              compact
              height={40}
              range={latest.range}
              points={item.chartable.map((r) => ({ date: r.date, value: r.num as number, flag: r.flag }))}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trends</Text>
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.navy} />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(s) => s.key}
            renderItem={renderRow}
            renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.navy} />}
            ListHeaderComponent={error ? <Text style={styles.errorText}>{error}</Text> : undefined}
            ListEmptyComponent={
              error ? undefined : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Nothing to track yet</Text>
                  <Text style={styles.emptyBody}>
                    Scan a lab report and each result will show up here with its history over time.
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}