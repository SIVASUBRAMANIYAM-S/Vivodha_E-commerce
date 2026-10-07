import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, shadow, spacing, useTheme } from '@/theme';

import { Text } from './Text';

export type SheetRef = BottomSheetModal;

type Props = {
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
};

/**
 * Themed bottom sheet (radius.sheet = 28) over @gorhom/bottom-sheet, sized to
 * its content. Present with ref.current?.present(), close with dismiss().
 * Reduced motion: the library follows the OS setting by default
 * (overrideReduceMotion = ReduceMotion.System), so the slide becomes instant.
 */
export const Sheet = forwardRef<SheetRef, Props>(function Sheet(
  { title, children, onDismiss },
  ref,
) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={1}
        style={[props.style, { backgroundColor: colors.overlay }]}
      />
    ),
    [colors.overlay],
  );

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.borderStrong, width: 40 }}
      backgroundStyle={{
        backgroundColor: colors.surfaceElevated,
        borderTopLeftRadius: radius.sheet,
        borderTopRightRadius: radius.sheet,
        boxShadow: shadow.lg,
      }}
      accessible
      accessibilityLabel={title}
    >
      <BottomSheetView style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        {title ? (
          <View style={styles.header}>
            <Text variant="h2" accessibilityRole="header">
              {title}
            </Text>
          </View>
        ) : null}
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  header: { paddingTop: spacing.xs, paddingBottom: spacing.xs },
});
