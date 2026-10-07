import { Check } from '@/components/icons';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Sheet, type SheetRef } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import type { CatalogProduct } from '@/features/catalog/api/catalog';
import { haptic } from '@/lib/haptics';
import { iconSize, radius, spacing, touch, useTheme } from '@/theme';
import { discountPercent, formatINR } from '@/utils/format';

type Request = {
  product: CatalogProduct;
  selectedId: string;
  onSelect: (variantId: string) => void;
};

type Api = { open: (req: Request) => void };

const VariantContext = createContext<Api>({ open: () => {} });

/**
 * One shared variant sheet for the whole app (cheaper than a sheet per card).
 * Cards call useVariantSelector().open({ product, selectedId, onSelect }).
 */
export function VariantSelectorProvider({ children }: { children: ReactNode }) {
  const ref = useRef<SheetRef>(null);
  const [req, setReq] = useState<Request | null>(null);

  const open = useCallback((next: Request) => {
    setReq(next);
    requestAnimationFrame(() => ref.current?.present());
  }, []);

  const api = useMemo(() => ({ open }), [open]);

  return (
    <VariantContext.Provider value={api}>
      {children}
      <Sheet ref={ref} title={req ? req.product.name : 'Choose an option'}>
        {req ? (
          <VariantList
            req={req}
            onChosen={(id) => {
              req.onSelect(id);
              setReq({ ...req, selectedId: id });
              ref.current?.dismiss();
            }}
          />
        ) : null}
      </Sheet>
    </VariantContext.Provider>
  );
}

export function useVariantSelector(): Api {
  return useContext(VariantContext);
}

function VariantList({ req, onChosen }: { req: Request; onChosen: (id: string) => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {req.product.variants.map((v) => {
        const selected = v.id === req.selectedId;
        const off = discountPercent(v.mrpPaise, v.pricePaise);
        return (
          <PressableScale
            key={v.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${v.label}, ${formatINR(v.pricePaise)}${off ? `, ${off}% off` : ''}`}
            onPress={() => {
              haptic('select');
              onChosen(v.id);
            }}
            pressedScale={0.98}
            style={[
              styles.row,
              {
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.surfaceTint : colors.surface,
              },
            ]}
          >
            <View style={styles.flex}>
              <Text variant="bodyStrong">{v.label}</Text>
              {off > 0 ? (
                <Text variant="small" color="discount">
                  {off}% OFF
                </Text>
              ) : null}
            </View>
            <View style={styles.priceCol}>
              <Text variant="price">{formatINR(v.pricePaise)}</Text>
              {off > 0 ? (
                <Text variant="mrp" color="textSecondary" strike>
                  {formatINR(v.mrpPaise)}
                </Text>
              ) : null}
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor: selected ? colors.primary : colors.borderStrong,
                  backgroundColor: selected ? colors.primary : 'transparent',
                },
              ]}
            >
              {selected ? (
                <Check size={iconSize.sm} color={colors.textOnPrimary} strokeWidth={3} />
              ) : null}
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touch.min + 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.card - 4,
    borderWidth: 1.5,
  },
  flex: { flex: 1, gap: spacing.xxs },
  priceCol: { alignItems: 'flex-end' },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
