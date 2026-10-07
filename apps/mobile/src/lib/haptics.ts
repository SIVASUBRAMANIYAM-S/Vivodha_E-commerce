import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { haptics, type HapticEvent, type HapticKind } from '@vivodha/shared/tokens';

function fire(kind: HapticKind): Promise<void> {
  switch (kind) {
    case 'impactLight':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'impactMedium':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'selection':
      return Haptics.selectionAsync();
    case 'notificationSuccess':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    case 'notificationWarning':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    case 'notificationError':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}

/** Fire the haptic mapped to an interaction (ADR-136). Never throws; no-op on web. */
export function haptic(event: HapticEvent): void {
  if (Platform.OS === 'web') return;
  fire(haptics[event]).catch(() => {
    // Haptics are best-effort (some devices/emulators have no vibrator).
  });
}
