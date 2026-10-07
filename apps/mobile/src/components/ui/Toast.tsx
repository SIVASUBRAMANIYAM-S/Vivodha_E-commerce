import { CircleAlert, CircleCheck, Info, type LucideIcon } from '@/components/icons';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptic } from '@/lib/haptics';
import { iconSize, radius, shadow, spacing, useTheme } from '@/theme';

import { Text } from './Text';

type Tone = 'info' | 'success' | 'error';
type ToastItem = { id: number; message: string; tone: Tone };
type ToastApi = { show: (message: string, tone?: Tone) => void };

const ToastContext = createContext<ToastApi>({ show: () => {} });

const DURATION_MS = 2600;
/** Clears the custom tab bar + cart bar. */
const BOTTOM_OFFSET = 132;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(1);

  const show = useCallback((message: string, tone: Tone = 'info') => {
    if (tone === 'error') haptic('error');
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: nextId.current++, message, tone });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? <ToastView key={toast.id} item={toast} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

function ToastView({ item }: { item: ToastItem }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const icons: Record<Tone, { icon: LucideIcon; color: string }> = {
    info: { icon: Info, color: colors.textOnPrimary },
    success: { icon: CircleCheck, color: colors.surfaceTint },
    error: { icon: CircleAlert, color: colors.textOnPrimary },
  };
  const { icon: Icon, color } = icons[item.tone];
  const bg = item.tone === 'error' ? colors.danger : colors.textPrimary;

  return (
    <View pointerEvents="none" style={[styles.host, { bottom: insets.bottom + BOTTOM_OFFSET }]}>
      <Animated.View
        entering={FadeInDown.springify().damping(18).stiffness(320)}
        exiting={FadeOutDown.duration(160)}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={[styles.toast, { backgroundColor: bg, boxShadow: shadow.lg }]}
      >
        <Icon size={iconSize.md} color={color} strokeWidth={2} />
        <Text variant="bodyStrong" style={[styles.message, { color: colors.textOnPrimary }]}>
          {item.message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: spacing.lg, right: spacing.lg, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    maxWidth: 480,
  },
  message: { flexShrink: 1 },
});
