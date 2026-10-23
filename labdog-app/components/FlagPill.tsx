import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';
import { styles } from '../styles/TrendStyle';
import type { Flag } from '../lib/markers';

const LABEL: Record<Flag, string> = { high: 'High', low: 'Low', normal: 'In range', unknown: 'No range' };

export default function FlagPill({ flag }: { flag: Flag }): React.JSX.Element {
  const out = flag === 'high' || flag === 'low';
  const bg = out ? colors.terracotta : flag === 'normal' ? colors.sage : colors.cream;
  const fg = out || flag === 'normal' ? colors.white : colors.navy;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{LABEL[flag]}</Text>
    </View>
  );
}