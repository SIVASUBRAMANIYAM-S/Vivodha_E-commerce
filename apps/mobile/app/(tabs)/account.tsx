import { router } from 'expo-router';
import { useState } from 'react';

import { LogOut, Palette, UserRound } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useSession } from '@/features/auth/store';
import { useCartStore } from '@/features/cart/store/cart-store';
import { supabase } from '@/lib/supabase';

export default function AccountScreen() {
  const session = useSession();
  const toast = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logOut() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      // Cart is user-scoped; location (pincode/serviceability) is device-scoped and survives logout.
      useCartStore.getState().clear();
      router.replace('/(onboarding)/splash');
    } catch {
      toast.show('Could not log out. Please try again.', 'error');
    } finally {
      setLoggingOut(false);
    }
  }

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
      {session ? (
        <Button
          title="Log out"
          variant="destructive"
          icon={LogOut}
          loading={loggingOut}
          onPress={logOut}
        />
      ) : null}
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
