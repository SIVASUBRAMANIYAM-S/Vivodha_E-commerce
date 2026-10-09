import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MapPin, PenLine } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { spacing } from '@/theme';

/**
 * Uses the OS's own on-device geocoder (expo-location) for the pincode, not
 * the planned geocode-reverse Edge Function (Step 7, not deployed yet) — a
 * deliberate interim choice so onboarding works end-to-end now. The search
 * screen always shows the detected pincode for the user to confirm/edit, so
 * a less precise on-device result never silently locks in a wrong address.
 */
export default function LocationChoiceScreen() {
  const router = useRouter();
  const toast = useToast();
  const [detecting, setDetecting] = useState(false);

  async function useCurrentLocation() {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast.show('Location access denied — enter your pincode instead.', 'info');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      if (!place?.postalCode) {
        toast.show("Couldn't detect your pincode — enter it manually.", 'info');
        router.push('/(onboarding)/location/search');
        return;
      }
      router.push({
        pathname: '/(onboarding)/location/search',
        params: { detectedPincode: place.postalCode },
      });
    } catch {
      toast.show("Couldn't get your location — enter your pincode instead.", 'error');
    } finally {
      setDetecting(false);
    }
  }

  return (
    <Screen>
      <View style={styles.body}>
        <Text variant="h1">Where should we deliver?</Text>
        <Text color="textSecondary">
          We use this to show accurate delivery times and availability.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          title="Use my current location"
          icon={MapPin}
          fullWidth
          size="lg"
          loading={detecting}
          onPress={useCurrentLocation}
        />
        <Button
          title="Enter pincode manually"
          icon={PenLine}
          variant="secondary"
          fullWidth
          size="lg"
          onPress={() => router.push('/(onboarding)/location/search')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  actions: { gap: spacing.md, paddingBottom: spacing.lg },
});
