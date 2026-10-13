import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { pincodeWaitlistSchema } from '@vivodha/shared/schemas';

import { ChevronLeft, CircleAlert, CircleCheck } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { joinPincodeWaitlist } from '@/features/location/api/waitlist';
import { useLocationStore } from '@/store/location-store';
import { iconSize, spacing, useTheme } from '@/theme';

export default function LocationResultScreen() {
  const router = useRouter();
  const toast = useToast();
  const { colors } = useTheme();
  const setLocation = useLocationStore((s) => s.setLocation);
  const params = useLocalSearchParams<{
    pincode: string;
    serviceable: string;
    etaText?: string;
    mode?: string;
  }>();
  const isServiceable = params.serviceable === 'true';

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string>();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  async function joinWaitlist() {
    const result = pincodeWaitlistSchema.safeParse({ pincode: params.pincode, phone });
    if (!result.success) {
      setPhoneError(result.error.issues[0]?.message);
      return;
    }
    setJoining(true);
    try {
      await joinPincodeWaitlist(result.data);
      setJoined(true);
    } catch {
      toast.show('Something went wrong. Please try again.', 'error');
    } finally {
      setJoining(false);
    }
  }

  function continueOnboarding() {
    setLocation(params.pincode, isServiceable);
    if (isServiceable) {
      router.push({
        pathname: '/(onboarding)/location/address-form',
        params: { pincode: params.pincode },
      });
    } else {
      router.replace('/(tabs)/home');
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
        {isServiceable ? (
          <>
            <CircleCheck size={iconSize.xl} color={colors.success} strokeWidth={1.75} />
            <Text variant="h1">We deliver to {params.pincode}</Text>
            {params.etaText ? <Text color="textSecondary">{params.etaText}</Text> : null}
          </>
        ) : (
          <>
            <CircleAlert size={iconSize.xl} color={colors.danger} strokeWidth={1.75} />
            <Text variant="h1">Not yet in {params.pincode}</Text>
            <Text color="textSecondary">
              We don&apos;t deliver here yet. Leave your number and we&apos;ll let you know when we
              do.
            </Text>
            {joined ? (
              <Text color="success">You&apos;re on the list — we&apos;ll notify you.</Text>
            ) : (
              <View style={styles.waitlistRow}>
                <Input
                  label="Phone number"
                  value={phone}
                  onChangeText={(t) => {
                    setPhone(t);
                    setPhoneError(undefined);
                  }}
                  error={phoneError}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                <Button title="Notify me" onPress={joinWaitlist} loading={joining} />
              </View>
            )}
          </>
        )}
      </View>
      <Button
        title={isServiceable ? 'Continue' : 'Continue browsing'}
        fullWidth
        size="lg"
        onPress={continueOnboarding}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start' },
  body: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  waitlistRow: { gap: spacing.sm, marginTop: spacing.sm },
  submit: { marginBottom: spacing.lg },
});
