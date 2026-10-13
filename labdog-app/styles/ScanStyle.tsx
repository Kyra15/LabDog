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

  scroll: { padding: 20, alignItems: 'center', backgroundColor: colors.cream, flex: 1, },

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

  placeholder: { color: colors.navy, opacity: 0.5, fontFamily: fonts.regular },

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

  buttonDisabled: { backgroundColor: colors.gold },

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
    opacity: 0.6,
    fontSize: 12,
    fontFamily: fonts.bold,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  summaryText: { color: colors.navy, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },

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
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },

  thumbRemoveText: { color: colors.white, fontSize: 11, fontFamily: fonts.bold },

  hint: {
    color: colors.navy,
    opacity: 0.7,
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: 10,
  },

  notice: { width: '100%', backgroundColor: colors.gold, borderRadius: 12, padding: 12, marginTop: 24 },

  noticeText: { color: colors.navy, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },

});