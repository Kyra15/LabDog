import { StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sage },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.sage,
    paddingVertical: 14,
  },

  scroll: { padding: 20, alignItems: 'center', paddingBottom: 40 },
  body: { flex: 1, backgroundColor: colors.cream },

  backLink: { alignSelf: 'flex-start', paddingVertical: 4 },

  backLinkText: { color: colors.white, fontSize: 15, fontFamily: fonts.bold },

  title: { fontSize: 22, fontFamily: fonts.bold, color: colors.navy, marginVertical: 16 },

  imageBox: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },

  image: { width: '100%', height: '100%', resizeMode: 'cover' },

  placeholder: { color: colors.navy, opacity: 0.6, fontFamily: fonts.regular },

  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },

  button: {
    flex: 1,
    backgroundColor: colors.sage,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  analyzeButton: {
    width: '100%',
    backgroundColor: colors.terracotta,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  buttonDisabled: { backgroundColor: colors.terracotta, opacity: 0.5 },

  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },

  summaryBox: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },

  summaryTitle: {
    color: colors.navy,
    fontSize: 22,
    fontFamily: fonts.bold,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  summaryText: { 
    color: colors.navy, 
    fontFamily: fonts.regular, 
    fontSize: 15, 
    lineHeight: 22,  
    marginBottom: 22,
  },

  stripWrap: { width: '100%', marginBottom: 16 },

  stripHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },

  pageCount: { color: colors.navy, opacity: 0.6, fontSize: 12, fontFamily: fonts.regular },

  clearLink: { color: colors.terracotta, fontSize: 12, fontFamily: fonts.bold },

  thumb: {
    width: 64,
    height: 84,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.navy,
  },

  thumbActive: { borderColor: colors.terracotta },

  thumbImage: { width: '100%', height: '100%', borderRadius: 6 },

  thumbRemove: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5
  },

  thumbRemoveText: { color: colors.white, fontSize: 11, fontFamily: fonts.bold },

  hint: {
    color: colors.navy,
    opacity: 0.6,
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: 10,
  },

  notice: { width: '100%', backgroundColor: colors.terracotta, borderRadius: 12, padding: 12, marginTop: 24 },

  noticeText: { color: colors.navy, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },

  resultTitle: { color: colors.navy, fontFamily: fonts.bold, fontSize: 17, marginBottom: 8 },

  sectionLabel: { 
    color: colors.navy, 
    fontSize: 18, 
    fontFamily: fonts.bold, 
    marginTop: 18, 
    marginBottom: 6 
  },

  markerList: { marginTop: 14 },

  markerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 10, 
    borderTopWidth: 1, 
    borderTopColor: `${colors.navy}22` 
  },

  markerMain: { flex: 1, paddingRight: 10 },

  markerChevron: { marginLeft: 6, opacity: 0.5 },

  markerName: { color: colors.navy, fontFamily: fonts.bold, fontSize: 14 },

  markerMeta: { 
    color: colors.navy, 
    opacity: 0.7, 
    fontFamily: fonts.regular, 
    fontSize: 13, 
    marginTop: 2 
  },

  flagPill: { 
    borderWidth: 1.5,
    borderRadius: 999, 
    paddingVertical: 4, 
    paddingHorizontal: 10, 
    backgroundColor: colors.white 
  },
  
  flagText: { color: colors.navy, fontFamily: fonts.bold, fontSize: 12 },

  flag_high: { borderColor: colors.terracotta },

  flag_low: { borderColor: colors.gold },

  flag_normal: { borderColor: colors.sage },

  flag_unknown: { borderColor: colors.navy },
  
  disclaimer: { 
    color: colors.navy, 
    opacity: 0.6, 
    fontFamily: fonts.regular, 
    fontSize: 12, 
    lineHeight: 17,
    marginTop: 18 
  },

});