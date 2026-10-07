import { router } from 'expo-router';
import { Palette, UserRound } from '@/components/icons';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';

export default function AccountScreen() {
  return (
    <Screen>
      <Text variant="h1" accessibilityRole="header">
        Account
      </Text>
      <EmptyState
        icon={UserRound}
        title="Coming in Phase 4"
        message="Profile, addresses, orders, Vivo Points and account deletion."
      />
      {__DEV__ ? (
        // Dev-only entry to the Design Lab (ADR-141); never rendered in production builds.
        <Button
          title="Open Design Lab"
          variant="secondary"
          icon={Palette}
          onPress={() => router.push('/design-lab')}
        />
      ) : null}
    </Screen>
  );
}
