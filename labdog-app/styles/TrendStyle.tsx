import { StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sage },
  body: { flex: 1, backgroundColor: colors.cream },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.sage,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontFamily: fonts.bold, color: colors.white, letterSpacing: 0.2 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
  backLinkText: { color: colors.white, fontSize: 15, fontFamily: fonts.bold },

  listContent: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  sectionTitle: {
    color: colors.navy,
    fontSize: 13,
    fontFamily: fonts.bold,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 8,
  },

  // one row per marker on the Trends tab
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  rowMain: { flex: 1 },
  rowName: { color: colors.navy, fontSize: 15, fontFamily: fonts.bold },
  rowValueLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  rowValue: { color: colors.navy, fontSize: 14, fontFamily: fonts.regular },
  rowMeta: { color: colors.navy, opacity: 0.55, fontSize: 11, fontFamily: fonts.regular, marginTop: 4 },
  spark: { width: 84 },

  pill: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999 },
  pillText: { fontSize: 11, fontFamily: fonts.bold },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 },
  emptyTitle: { color: colors.navy, fontSize: 16, fontFamily: fonts.bold, marginBottom: 6 },
  emptyBody: { color: colors.navy, opacity: 0.6, fontSize: 13, fontFamily: fonts.regular, textAlign: 'center', lineHeight: 18 },
  errorText: { color: colors.terracotta, fontFamily: fonts.bold, fontSize: 13, textAlign: 'center', marginBottom: 10 },

  // marker detail page
  scroll: { padding: 20, paddingBottom: 48 },
  groupLabel: { color: colors.navy, opacity: 0.55, fontSize: 12, fontFamily: fonts.bold, textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { color: colors.navy, fontSize: 26, fontFamily: fonts.bold, marginTop: 2, marginBottom: 14 },

  card: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: { color: colors.navy, fontSize: 15, fontFamily: fonts.bold, marginBottom: 10 },

  latestRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  latestValue: { color: colors.navy, fontSize: 36, fontFamily: fonts.bold },
  latestUnit: { color: colors.navy, opacity: 0.7, fontSize: 15, fontFamily: fonts.regular },
  latestMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  metaText: { color: colors.navy, opacity: 0.65, fontSize: 13, fontFamily: fonts.regular },
  change: { color: colors.navy, fontSize: 13, fontFamily: fonts.bold, marginTop: 10 },

  legend: { flexDirection: 'row', gap: 14, marginTop: 10, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 5 },
  legendBand: { width: 14, height: 10, borderRadius: 3, backgroundColor: colors.sage, opacity: 0.35 },
  legendText: { color: colors.navy, opacity: 0.65, fontSize: 11, fontFamily: fonts.regular },
  chartNote: { color: colors.navy, opacity: 0.6, fontSize: 12, fontFamily: fonts.regular, marginTop: 8, lineHeight: 17 },

  about: { color: colors.navy, fontSize: 14, fontFamily: fonts.regular, lineHeight: 21 },

  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(61, 64, 91, 0.12)',
  },
  readingRowFirst: { borderTopWidth: 0, paddingTop: 0 },
  readingLeft: { flex: 1, paddingRight: 10 },
  readingDate: { color: colors.navy, fontSize: 14, fontFamily: fonts.bold },
  readingReport: { color: colors.navy, opacity: 0.55, fontSize: 12, fontFamily: fonts.regular, marginTop: 2 },
  readingRight: { alignItems: 'flex-end', gap: 4 },
  readingValue: { color: colors.navy, fontSize: 14, fontFamily: fonts.regular },

  disclaimer: {
    color: colors.navy,
    opacity: 0.55,
    fontSize: 11,
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
});