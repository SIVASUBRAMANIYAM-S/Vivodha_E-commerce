import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ChevronLeft } from '@/components/icons';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useSession } from '@/features/auth/store';
import { createAddress } from '@/features/location/api/addresses';
import { AddressForm, type AddressFormValues } from '@/features/location/components/AddressForm';
import { spacing } from '@/theme';

export default function LocationAddressFormScreen() {
  const router = useRouter();
  const toast = useToast();
  const session = useSession();
  const { pincode } = useLocalSearchParams<{ pincode: string }>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values: AddressFormValues) {
    if (!session) {
      toast.show('Something went wrong. Please try again.', 'error');
      return;
    }
    setLoading(true);
    try {
      await createAddress(session.user.id, { ...values, isDefault: true });
      router.replace('/(tabs)/home');
    } catch {
      toast.show('Could not save your address. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <IconButton
        icon={ChevronLeft}
        accessibilityLabel="Back"
        onPress={() => router.back()}
        style={styles.back}
      />
      <Text variant="h1">Add your address</Text>
      <Text color="textSecondary">This is where we&apos;ll deliver your orders.</Text>
      <AddressForm
        initialValues={{ pincode }}
        pincodeLocked
        loading={loading}
        submitLabel="Save and continue"
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ back: { alignSelf: 'flex-start', marginBottom: spacing.sm } });
