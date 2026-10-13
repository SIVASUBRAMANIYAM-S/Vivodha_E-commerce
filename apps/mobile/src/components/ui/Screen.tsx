import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { spacing, useTheme } from '@/theme';

export type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  tone?: 'surface' | 'muted';
  contentStyle?: ViewStyle;
};

/**
 * Base screen container: safe area + themed background + keyboard
 * avoidance, so a submit button pinned below a focused input (e.g. a
 * number-pad with no "Done" key) is never left hidden under the keyboard.
 */
export function Screen({
  children,
  scroll = false,
  edges = ['top'],
  tone = 'surface',
  contentStyle,
}: ScreenProps) {
  const { colors } = useTheme();
  const bg = tone === 'muted' ? colors.surfaceMuted : colors.surface;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
});
