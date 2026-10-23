import React, { useState } from 'react';
import { View, Text, type LayoutChangeEvent } from 'react-native';
import { colors, fonts } from '../theme';
import type { Flag, Range } from '../lib/markers';

export interface ChartPoint {
  date: string;
  value: number;
  flag: Flag;
}

interface Props {
  points: ChartPoint[];
  range?: Range | null;
  height?: number;
  compact?: boolean;
}

export const flagColor = (flag: Flag): string =>
  flag === 'high' || flag === 'low' ? colors.terracotta : flag === 'normal' ? colors.sage : colors.navy;

const fmt = (n: number): string => (Math.abs(n) >= 100 ? n.toFixed(0) : Number(n.toFixed(2)).toString());

function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

export default function MarkerChart({ points, range, height = 180, compact = false }: Props): React.JSX.Element {
  const [width, setWidth] = useState<number>(0);
  const onLayout = (e: LayoutChangeEvent): void => setWidth(e.nativeEvent.layout.width);

  const labelW = compact ? 0 : 40;
  const padX = compact ? 4 : 12;
  const padY = compact ? 4 : 12;
  const bottomLabels = compact ? 0 : 20;
  const plotH = height - bottomLabels;
  const plotW = Math.max(width - labelW, 1);

  // y scale covers the values and the reference range w padding
  const values = points.map((p) => p.value);
  const bounds = [...values];
  if (range?.low != null) bounds.push(range.low);
  if (range?.high != null) bounds.push(range.high);
  let min = Math.min(...bounds);
  let max = Math.max(...bounds);
  if (min === max) {
    min -= Math.abs(min) * 0.1 || 1;
    max += Math.abs(max) * 0.1 || 1;
  }
  const pad = (max - min) * 0.12;
  min -= pad;
  max += pad;
  const y = (v: number): number => padY + (1 - (v - min) / (max - min)) * (plotH - padY * 2);

  const times = points.map((p) => new Date(p.date).getTime());
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const x = (t: number): number =>
    t1 === t0 ? plotW / 2 : padX + ((t - t0) / (t1 - t0)) * (plotW - padX * 2);

  const xy = points.map((p, i) => ({ px: x(times[i]), py: y(p.value), p }));
  const dot = compact ? 6 : 10;
  const line = compact ? 1.5 : 2;

  const bandTop = range?.high != null ? y(range.high) : 0;
  const bandBottom = range?.low != null ? y(range.low) : plotH;
  const showBand = !!range && (range.low != null || range.high != null);

  return (
    <View style={{ height, flexDirection: 'row' }}>
      {!compact && (
        <View style={{ width: labelW, height: plotH }}>
          <Text style={[axisText, { position: 'absolute', top: padY - 7 }]}>{fmt(max - pad)}</Text>
          <Text style={[axisText, { position: 'absolute', top: plotH - padY - 7 }]}>{fmt(min + pad)}</Text>
        </View>
      )}
      <View style={{ flex: 1 }} onLayout={onLayout}>
        <View style={{ height: plotH }}>
          {showBand && width > 0 && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: bandTop,
                height: Math.max(bandBottom - bandTop, 1),
                backgroundColor: colors.sage,
                opacity: 0.18,
                borderRadius: 4,
              }}
            />
          )}

          {width > 0 &&
            xy.slice(1).map((b, i) => {
              const a = xy[i];
              const dx = b.px - a.px;
              const dy = b.py - a.py;
              const len = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);
              return (
                <View
                  key={`l${i}`}
                  style={{
                    position: 'absolute',
                    left: (a.px + b.px) / 2 - len / 2,
                    top: (a.py + b.py) / 2 - line / 2,
                    width: len,
                    height: line,
                    backgroundColor: colors.navy,
                    opacity: 0.6,
                    transform: [{ rotate: `${angle}rad` }],
                  }}
                />
              );
            })}

          {width > 0 &&
            xy.map(({ px, py, p }, i) => (
              <View
                key={`d${i}`}
                style={{
                  position: 'absolute',
                  left: px - dot / 2,
                  top: py - dot / 2,
                  width: dot,
                  height: dot,
                  borderRadius: dot / 2,
                  backgroundColor: flagColor(p.flag),
                  borderWidth: compact ? 0 : 2,
                  borderColor: colors.white,
                }}
              />
            ))}
        </View>

        {!compact && points.length > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: points.length > 1 ? 'space-between' : 'center', paddingHorizontal: 2 }}>
            <Text style={axisText}>{shortDate(points[0].date)}</Text>
            {points.length > 1 && <Text style={axisText}>{shortDate(points[points.length - 1].date)}</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

const axisText = { color: colors.navy, opacity: 0.55, fontSize: 11, fontFamily: fonts.regular };