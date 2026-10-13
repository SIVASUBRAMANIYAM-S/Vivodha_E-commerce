import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ADDRESS_LABELS, type AddressLabel } from '@vivodha/shared/constants';
import { addressSchema, type AddressInput } from '@vivodha/shared/schemas';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/theme';

const LABEL_TITLES: Record<AddressLabel, string> = { home: 'Home', work: 'Work', other: 'Other' };

export type AddressFormValues = Omit<AddressInput, 'isDefault'>;

/**
 * Shared by onboarding (first address) and the Account tab's "add/edit
 * address" (Step 8) — kept as one form so the two never drift apart.
 */
export function AddressForm({
  initialValues,
  submitLabel = 'Save address',
  loading = false,
  pincodeLocked = false,
  onSubmit,
}: {
  initialValues?: Partial<AddressFormValues>;
  submitLabel?: string;
  loading?: boolean;
  /** True once a pincode's serviceability has already been confirmed upstream (onboarding). */
  pincodeLocked?: boolean;
  onSubmit: (values: AddressFormValues) => void;
}) {
  const [values, setValues] = useState<AddressFormValues>({
    fullName: initialValues?.fullName ?? '',
    phone: initialValues?.phone ?? '',
    line1: initialValues?.line1 ?? '',
    line2: initialValues?.line2 ?? '',
    landmark: initialValues?.landmark ?? '',
    city: initialValues?.city ?? '',
    state: initialValues?.state ?? '',
    pincode: initialValues?.pincode ?? '',
    label: initialValues?.label ?? 'home',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormValues, string>>>({});

  function set<K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function submit() {
    const result = addressSchema.safeParse({ ...values, isDefault: true });
    if (!result.success) {
      const next: Partial<Record<keyof AddressFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof AddressFormValues;
        next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(values);
  }

  return (
    <View style={styles.form}>
      <Input
        label="Full name"
        value={values.fullName}
        onChangeText={(t) => set('fullName', t)}
        error={errors.fullName}
        autoCapitalize="words"
      />
      <Input
        label="Phone number"
        value={values.phone}
        onChangeText={(t) => set('phone', t)}
        error={errors.phone}
        keyboardType="phone-pad"
        maxLength={10}
      />
      <Input
        label="House / flat / building"
        value={values.line1}
        onChangeText={(t) => set('line1', t)}
        error={errors.line1}
      />
      <Input
        label="Area / street (optional)"
        value={values.line2}
        onChangeText={(t) => set('line2', t)}
        error={errors.line2}
      />
      <Input
        label="Landmark (optional)"
        value={values.landmark}
        onChangeText={(t) => set('landmark', t)}
        error={errors.landmark}
      />
      <Input
        label="City"
        value={values.city}
        onChangeText={(t) => set('city', t)}
        error={errors.city}
      />
      <Input
        label="State"
        value={values.state}
        onChangeText={(t) => set('state', t)}
        error={errors.state}
      />
      <Input
        label="Pincode"
        value={values.pincode}
        onChangeText={(t) => set('pincode', t)}
        error={errors.pincode}
        keyboardType="number-pad"
        maxLength={6}
        editable={!pincodeLocked}
      />
      <View style={styles.labelField}>
        <Text variant="small" color="textSecondary">
          Save as
        </Text>
        <View style={styles.labelRow}>
          {ADDRESS_LABELS.map((label) => (
            <Chip
              key={label}
              label={LABEL_TITLES[label]}
              selected={values.label === label}
              onPress={() => set('label', label)}
            />
          ))}
        </View>
      </View>
      <Button title={submitLabel} onPress={submit} loading={loading} fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  labelField: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', gap: spacing.sm },
});
