import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { pincodeSchema } from '@vivodha/shared/schemas';

import { ChevronLeft } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { checkPincode } from '@/features/location/api/serviceability';
import { spacing } from '@/theme';

/** Places/address autocomplete lands with the places-autocomplete Edge Function (Step 7). */
export default function LocationSearchScreen() {
  const router = useRouter();
  const { detectedPincode } = useLocalSearchParams<{ detectedPincode?: string }>();
  const [pincode, setPincode] = useState(detectedPincode ?? '');
  const [error, setError] = useState<string>();
  const [checking, setChecking] = useState(false);

  async function submit() {
    const result = pincodeSchema.safeParse(pincode);
    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }
    setChecking(true);
    setError(undefined);
    try {
      const outcome = await checkPincode(result.data);
      router.push({
        pathname: '/(onboarding)/location/result',
        params: {
          pincode: result.data,
          serviceable: String(outcome?.serviceable ?? false),
          etaText: outcome?.etaText ?? '',
          mode: outcome?.mode ?? '',
        },
      });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <Screen>
      <IconButton
        icon={ChevronLeft}
        accessibilityLabel="Back"
        onPress={() => router.back()}
        style={styles.back}
      />
      <View style={styles.body}>
        <Text variant="h1">Enter your pincode</Text>
        <Text color="textSecondary">We&apos;ll check if we deliver to your area.</Text>
        <Input
          label="Pincode"
          value={pincode}
          onChangeText={(t) => {
            setPincode(t);
            setError(undefined);
          }}
          error={error}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />
      </View>
      <Button
        title="Check availability"
        fullWidth
        size="lg"
        loading={checking}
        onPress={submit}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start' },
  body: { flex: 1, gap: spacing.sm },
  submit: { marginBottom: spacing.lg },
});
