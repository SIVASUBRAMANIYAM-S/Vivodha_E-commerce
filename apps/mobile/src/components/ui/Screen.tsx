import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { spacing, useTheme } from '@/theme';

export type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  tone?: 'surface' | 'muted';
  contentStyle?: ViewStyle;
};

/** Base screen container: safe area + themed background. */
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
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, contentStyle]}>{children}</ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
});
