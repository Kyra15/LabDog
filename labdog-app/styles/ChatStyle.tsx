import { StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sage },
  body: { flex: 1, backgroundColor: colors.cream },

  headerColor: {
    backgroundColor: colors.sage,
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.sage,
    paddingVertical: 14,
  },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 10},
  wordmark: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.white,
    letterSpacing: 0.2,
  },

  headerTitle: { fontSize: 22, fontFamily: fonts.bold, color: colors.white, letterSpacing: 0.2 },
  headerButton: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.navy,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  headerButtonText: { color: colors.navy, fontFamily: fonts.regular, fontSize: 12 },

  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightsButton: { paddingVertical: 8, paddingHorizontal: 10 },
  insightsButtonText: { color: colors.navy, fontFamily: fonts.regular, fontSize: 13 },

   contextBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(61, 64, 91, 0.15)',
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.navy,
    maxWidth: 220,
  },
  contextChipOn: { backgroundColor: colors.sage, borderColor: colors.sage },
  contextChipText: { color: colors.navy, fontFamily: fonts.regular, fontSize: 12 },
  contextChipTextOn: { color: colors.white, fontFamily: fonts.bold },
 
  listContent: { padding: 16, paddingBottom: 8, flexGrow: 1 },
 
  bubbleRow: { flexDirection: 'row', marginBottom: 10 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAssistant: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18 },
  bubbleUser: { backgroundColor: colors.navy, borderBottomRightRadius: 6 },
  bubbleAssistant: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderBottomLeftRadius: 6,
  },
  bubbleText: { fontSize: 15, lineHeight: 21, fontFamily: fonts.regular },
  bubbleTextUser: { color: colors.white },
  bubbleTextAssistant: { color: colors.navy },
 
  usingReport: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  usingReportText: { color: colors.sage, fontFamily: fonts.bold, fontSize: 12 },
 
  // provider cards inside a reply
  providerList: { marginTop: 10, gap: 8 },
  providerCard: {
    backgroundColor: colors.cream,
    borderRadius: 12,
    padding: 12,
  },
  providerName: { color: colors.navy, fontFamily: fonts.bold, fontSize: 14 },
  providerMeta: { color: colors.navy, opacity: 0.7, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  providerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  providerActions: { flexDirection: 'row', gap: 16 },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999 },
  badgeOpen: { backgroundColor: colors.sage },
  badgeWait: { backgroundColor: colors.gold },
  badgeText: { color: colors.navy, fontFamily: fonts.bold, fontSize: 11 },
  sampleNote: { color: colors.navy, opacity: 0.5, fontFamily: fonts.regular, fontSize: 11, textAlign: 'center' },
 
  thinkingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  thinkingText: { color: colors.navy, opacity: 0.7, fontFamily: fonts.regular, fontSize: 13 },
 
  emptyState: { flex: 1, justifyContent: 'center', paddingHorizontal: 12 },
  emptyTitle: { color: colors.navy, fontSize: 20, fontFamily: fonts.bold, marginBottom: 6 },
  emptyBody: { color: colors.navy, opacity: 0.7, fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
 
  // tap-to-send suggestion chips above the input
  suggestionList: { flexGrow: 0 },
  suggestionRow: { paddingHorizontal: 12, paddingVertical: 6, gap: 8 },
  suggestion: {
    width: 220,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.sage,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  suggestionText: { color: colors.navy, fontFamily: fonts.regular, fontSize: 13 },
 
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: colors.cream,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.navy,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
  disclaimer: {
    textAlign: 'center',
    color: colors.navy,
    opacity: 0.55,
    fontSize: 11,
    fontFamily: fonts.regular,
    paddingBottom: 8,
    paddingHorizontal: 16,
  }
});