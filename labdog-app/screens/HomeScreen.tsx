import React, { useCallback, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { styles } from '../styles/HomeStyle';
// import { listReports, type ReportCard } from '../lib/reports';

// export interface Report {
//   id: string;
//   title: string;
//   date: string;
//   thumbnailUri?: string;
// }

// const MOCK_REPORTS: Report[] = [
//   { id: 'a1029', title: 'Comprehensive Metabolic Panel', date: 'Aug 18, 2026' },
//   { id: 'a1017', title: 'Lipid Panel', date: 'Jul 30, 2026' },
//   { id: 'a1004', title: 'CBC with Differential', date: 'Jul 12, 2026' },
//   { id: 'a0988', title: 'Thyroid Panel (TSH, T3, T4)', date: 'Jun 02, 2026' },
// ];

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { signOut } = useAuth();

  const [reports, setReports] = useState<ReportCard[]>([]);
  // create report object
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
 
  const load = useCallback(async (): Promise<void> => {
    try {
      setReports(await listReports());
      // need to set reports
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your reports.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };
 
  const renderCard = ({ item }: { item: ReportCard }): React.JSX.Element => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Scan')}
    >
      <View style={styles.thumbnail}>
        {item.thumbnailUri && (
          <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnailImage} />
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardMeta}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.wordmarkRow}>
          <Text style={styles.wordmark}>LabDog</Text>
        </View>

        <View style={styles.headerActions}>

          <TouchableOpacity style={styles.authButton} onPress={() => signOut()} activeOpacity={0.8}>
            <Text style={styles.authButtonText}>Sign Out</Text>
          </TouchableOpacity>
          
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Your Reports</Text>
        </View>

        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No reports yet</Text>
              <Text style={styles.emptyBody}>Scan a lab report to see it show up here.</Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.fabPlus}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}