import { Truck } from '@/components/icons';
import { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { Celebration } from '@/components/ui/Celebration';
import { Text } from '@/components/ui/Text';
import { haptic } from '@/lib/haptics';
import { useSessionStore } from '@/store/session-store';
import { radius, spacing, springTo, useTheme } from '@/theme';
import { formatINR } from '@/utils/format';

type Props = {
  subtotalPaise: number;
  thresholdPaise: number;
  tone?: 'onLight' | 'onDark';
  /** Only one instance (the CartBar) should own the once-per-session celebration. */
  celebrate?: boolean;
};

/**
 * Signature interaction 4: the bar fills smoothly as the cart grows; crossing
 * the threshold plays a short burst + success haptic, once per app session.
 */
export const FreeDeliveryProgress = memo(function FreeDeliveryProgress({
  subtotalPaise,
  thresholdPaise,
  tone = 'onLight',
  celebrate = false,
}: Props) {
  const { colors } = useTheme();
  const ratio = thresholdPaise > 0 ? Math.min(subtotalPaise / thresholdPaise, 1) : 1;
  const reached = subtotalPaise >= thresholdPaise;
  const remaining = Math.max(thresholdPaise - subtotalPaise, 0);
  const fill = useSharedValue(ratio);
  const prevReached = useRef(reached);
  const [burst, setBurst] = useState(0);
  const celebrated = useSessionStore((s) => s.freeDeliveryCelebrated);
  const markCelebrated = useSessionStore((s) => s.markFreeDeliveryCelebrated);

  useEffect(() => {
    fill.value = springTo(ratio, 'gentle');
  }, [fill, ratio]);

  useEffect(() => {
    if (celebrate && reached && !prevReached.current && !celebrated) {
      haptic('success');
      setBurst((b) => b + 1);
      markCelebrated();
    }
    prevReached.current = reached;
  }, [celebrate, celebrated, markCelebrated, reached]);

  const barStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  const onDark = tone === 'onDark';
  const textColor = onDark ? colors.textOnPrimary : colors.textPrimary;
  const track = onDark ? 'rgba(255,255,255,0.28)' : colors.surfaceTint;
  const bar = onDark ? colors.textOnPrimary : colors.primary;
  const message = reached
    ? 'You get free delivery!'
    : `Add ${formatINR(remaining)} more for free delivery`;

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
    >
      <View style={styles.row}>
        <Truck size={16} color={textColor} strokeWidth={2} />
        <Text variant="small" style={{ color: textColor }} numberOfLines={1}>
          {message}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: track }]}>
        <Animated.View style={[styles.bar, { backgroundColor: bar }, barStyle]} />
      </View>
      <Celebration trigger={burst} size={140} />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  track: { height: 6, borderRadius: radius.pill, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: radius.pill },
});
