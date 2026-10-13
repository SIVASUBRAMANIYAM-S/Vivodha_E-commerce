import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { LogoMark } from '@/components/brand/LogoMark';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/theme';
import { useIsOffline } from '@/components/ui/States';

export function AuthScreen({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const offline = useIsOffline();
  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.container}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <LogoMark size={56} />
          <Text variant="h1" accessibilityRole="header">
            {title}
          </Text>
          {description ? <Text color="textSecondary">{description}</Text> : null}
          {offline ? (
            <Text color="danger" accessibilityRole="alert">
              You&apos;re offline. Connect to continue.
            </Text>
          ) : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  container: { padding: 0 },
  fill: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
});
