import NetInfo from '@react-native-community/netinfo';
import { CircleAlert, PackageOpen, WifiOff, type LucideIcon } from '@/components/icons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { iconSize, radius, spacing, useTheme } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

type StateProps = {
  title: string;
  message?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
};

function StateLayout({
  title,
  message,
  icon: Icon,
  actionLabel,
  onAction,
  tone,
}: StateProps & { tone: 'primary' | 'danger' }) {
  const { colors } = useTheme();
  const fg = tone === 'danger' ? colors.danger : colors.primary;
  return (
    <View style={styles.state} accessibilityRole="summary">
      {Icon ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceTint }]}>
          <Icon size={iconSize.xl} color={fg} strokeWidth={1.75} />
        </View>
      ) : null}
      <Text variant="h2" align="center">
        {title}
      </Text>
      {message ? (
        <Text color="textSecondary" align="center">
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

export function EmptyState({ icon = PackageOpen, ...rest }: StateProps) {
  return <StateLayout icon={icon} tone="primary" {...rest} />;
}

/** Error with retry. Fires the error haptic once when it appears. */
export function ErrorState({
  title = 'Something went wrong',
  message = 'Please check your connection and try again.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  useEffect(() => {
    haptic('error');
  }, []);
  return (
    <StateLayout
      icon={CircleAlert}
      tone="danger"
      title={title}
      message={message}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}

/** Subscribes to connectivity; cached data stays visible underneath. */
export function useIsOffline(): boolean {
  const [offline, setOffline] = useState(false);
  useEffect(
    () =>
      NetInfo.addEventListener((s) => {
        setOffline(s.isConnected === false || s.isInternetReachable === false);
      }),
    [],
  );
  return offline;
}

export function OfflineBanner({ forceVisible }: { forceVisible?: boolean }) {
  const offline = useIsOffline();
  const { colors } = useTheme();
  if (!offline && !forceVisible) return null;
  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[styles.offline, { backgroundColor: colors.textPrimary }]}
    >
      <WifiOff size={iconSize.sm} color={colors.textOnPrimary} strokeWidth={2} />
      <Text variant="small" style={{ color: colors.textOnPrimary }}>
        You&apos;re offline. Showing saved items.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  state: { alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
