/**
 * Design Lab (dev-only, ADR-141): every component in every state, every
 * signature interaction, motion/colour/type tokens with live contrast ratios.
 * Required lazily by app/design-lab.tsx only when __DEV__ is true.
 */
import { ArrowRight, Heart, Plus, Search, ShoppingCart, Sparkles, Trash } from '@/components/icons';
import { useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddStepper } from '@/components/commerce/AddStepper';
import { BannerCarousel } from '@/components/commerce/BannerCarousel';
import { CategoryTile } from '@/components/commerce/CategoryTile';
import { FreeDeliveryProgress } from '@/components/commerce/FreeDeliveryProgress';
import { PointsBadge } from '@/components/commerce/PointsBadge';
import { PriceTag } from '@/components/commerce/PriceTag';
import { ProductCard } from '@/components/commerce/ProductCard';
import { RailSkeleton } from '@/components/commerce/ProductRail';
import { SectionHeader } from '@/components/commerce/SectionHeader';
import { ShoppingListCard } from '@/components/commerce/ShoppingListCard';
import { useVariantSelector } from '@/components/commerce/VariantSelector';
import { LogoMark } from '@/components/brand/LogoMark';
import { FadeUpOnce } from '@/components/motion/FadeUpOnce';
import { useCartTarget, useFlyToCart } from '@/components/motion/FlyToCart';
import { LeafRefresh } from '@/components/motion/LeafRefresh';
import {
  AnimatedPrice,
  Badge,
  Button,
  Celebration,
  Chip,
  Divider,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  OfflineBanner,
  RollingNumber,
  SearchBar,
  Sheet,
  Skeleton,
  SuccessCheck,
  Surface,
  Text,
  useToast,
  type SheetRef,
} from '@/components/ui';
import { useCatalog } from '@/features/catalog/api/catalog';
import { useHome } from '@/features/catalog/api/home';
import { haptic } from '@/lib/haptics';
import { useSessionStore } from '@/store/session-store';
import {
  accessible,
  brand,
  contrastLevel,
  contrastRatio,
  duration,
  lightTheme,
  radius,
  shadow,
  spacing,
  spring,
  stagger,
  typeScale,
  useMotionPreference,
  useTheme,
  type ThemeColorToken,
  type TypeVariant,
} from '@/theme';

import type { HapticEvent } from '@vivodha/shared/tokens';

export function DesignLab() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: colors.surfaceMuted }}
      contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + spacing.xxxl }]}
    >
      <Intro />
      <ColorsSection />
      <TypeSection />
      <ShapeSection />
      <MotionSection />
      <HapticsSection />
      <ButtonsSection />
      <InputsSection />
      <ChipsBadgesSection />
      <CommerceSection />
      <NumbersSection />
      <FeedbackSection />
      <InteractionsSection />
      <SheetSection />
    </ScrollView>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <Surface style={styles.section}>
      <Text variant="h2" accessibilityRole="header">
        {title}
      </Text>
      {note ? (
        <Text variant="small" color="textSecondary">
          {note}
        </Text>
      ) : null}
      <View style={styles.sectionBody}>{children}</View>
    </Surface>
  );
}

function Row({ children, wrap = true }: { children: ReactNode; wrap?: boolean }) {
  return <View style={[styles.row, wrap && styles.wrap]}>{children}</View>;
}

function Label({ children }: { children: ReactNode }) {
  return (
    <Text variant="caption" color="textSecondary">
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------

function Intro() {
  const { reduceMotion } = useMotionPreference();
  return (
    <View style={styles.intro}>
      <LogoMark size={48} />
      <Text variant="display">Design Lab</Text>
      <Text color="textSecondary">
        Fresh Futurism — every component, state and interaction. Dev builds only.
      </Text>
      <Badge
        tone={reduceMotion ? 'accent' : 'neutral'}
        label={reduceMotion ? 'Reduced motion: ON (fades replace movement)' : 'Reduced motion: off'}
      />
    </View>
  );
}

const PAIRS: { fg: ThemeColorToken | 'white'; bg: ThemeColorToken }[] = [
  { fg: 'textPrimary', bg: 'surface' },
  { fg: 'textPrimary', bg: 'surfaceTint' },
  { fg: 'textSecondary', bg: 'surface' },
  { fg: 'textSecondary', bg: 'surfaceTint' },
  { fg: 'primary', bg: 'surface' },
  { fg: 'primary', bg: 'surfaceTint' },
  { fg: 'textOnPrimary', bg: 'primary' },
  { fg: 'textOnAccent', bg: 'warning' },
  { fg: 'warningText', bg: 'surface' },
  { fg: 'discount', bg: 'surface' },
  { fg: 'white', bg: 'discount' },
  { fg: 'points', bg: 'surface' },
  { fg: 'points', bg: 'pointsSoft' },
];

function ColorsSection() {
  const { colors } = useTheme();
  const tokens = Object.keys(lightTheme) as ThemeColorToken[];
  return (
    <Section
      title="Colour"
      note="Semantic tokens (light). Ratios computed live from the tokens; AA needs 4.5 for normal text."
    >
      <View style={styles.swatches}>
        {tokens
          .filter((t) => colors[t].startsWith('#'))
          .map((t) => (
            <View key={t} style={styles.swatch}>
              <View
                style={[
                  styles.swatchColor,
                  { backgroundColor: colors[t], borderColor: colors.border },
                ]}
              />
              <Text variant="caption" numberOfLines={1}>
                {t}
              </Text>
              <Text variant="caption" color="textSecondary">
                {colors[t]}
              </Text>
            </View>
          ))}
      </View>
      <Divider />
      {PAIRS.map(({ fg, bg }) => {
        const fgHex = fg === 'white' ? '#FFFFFF' : colors[fg];
        const ratio = contrastRatio(fgHex, colors[bg]);
        const level = contrastLevel(ratio);
        return (
          <View key={`${fg}-${bg}`} style={[styles.pair, { backgroundColor: colors[bg] }]}>
            <Text variant="bodyStrong" style={{ color: fgHex, flex: 1 }}>
              {fg} on {bg}
            </Text>
            <Text variant="counter" style={{ color: fgHex }}>
              {ratio.toFixed(2)} {level}
            </Text>
          </View>
        );
      })}
      <Label>
        Failures that motivated the accessible variants: brand offer {brand.offer} on white{' '}
        {contrastRatio(brand.offer, '#FFFFFF').toFixed(2)} → {accessible.offerStrong}; white on
        saffron {contrastRatio('#FFFFFF', brand.saffron).toFixed(2)} → ink text only.
      </Label>
    </Section>
  );
}

function TypeSection() {
  return (
    <Section title="Type scale" note="Poppins: headings, prices, counters (tabular). Inter: body.">
      {(Object.keys(typeScale) as TypeVariant[]).map((v) => {
        const t = typeScale[v];
        return (
          <View key={v} style={styles.typeRow}>
            <Label>
              {v} · {t.family === 'heading' ? 'Poppins' : 'Inter'} {t.size}/{t.lineHeight}{' '}
              {t.weight}
              {'numeric' in t && t.numeric ? ' · tnum' : ''}
            </Label>
            <Text variant={v}>
              {'numeric' in t && t.numeric ? '₹1,234.50  0123456789' : 'Fresh to your door'}
            </Text>
          </View>
        );
      })}
    </Section>
  );
}

function ShapeSection() {
  const { colors } = useTheme();
  return (
    <Section title="Shape & depth" note="Radii by role; soft layered shadows (boxShadow).">
      <Row>
        {(['badge', 'button', 'card', 'sheet'] as const).map((r) => (
          <View key={r} style={styles.center}>
            <View
              style={[
                styles.shapeBox,
                { borderRadius: radius[r], backgroundColor: colors.surfaceTint },
              ]}
            />
            <Label>
              {r} {radius[r]}
            </Label>
          </View>
        ))}
      </Row>
      <Row>
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <View key={s} style={styles.center}>
            <View
              style={[
                styles.shapeBox,
                {
                  borderRadius: radius.card,
                  backgroundColor: colors.surface,
                  boxShadow: shadow[s],
                },
              ]}
            />
            <Label>shadow.{s}</Label>
          </View>
        ))}
      </Row>
    </Section>
  );
}

function SpringDemo({ name }: { name: keyof typeof spring }) {
  const { colors } = useTheme();
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View style={styles.springRow}>
      <Button
        title={name}
        variant="secondary"
        onPress={() => {
          x.set(withSpring(x.get() === 0 ? 160 : 0, spring[name]));
        }}
      />
      <View style={styles.springTrack}>
        <Animated.View style={[styles.springDot, { backgroundColor: colors.primary }, style]} />
      </View>
    </View>
  );
}

function MotionSection() {
  return (
    <Section title="Motion tokens" note="Tap a spring to play it. All on the UI thread.">
      <Label>
        Durations: instant {duration.instant} · fast {duration.fast} · base {duration.base} · slow{' '}
        {duration.slow} ms
      </Label>
      <Label>
        Stagger: {stagger.interval} ms × max {stagger.maxItems} items (first load only)
      </Label>
      {(Object.keys(spring) as (keyof typeof spring)[]).map((s) => (
        <View key={s} style={styles.gapXs}>
          <SpringDemo name={s} />
          <Label>
            damping {spring[s].damping} · stiffness {spring[s].stiffness} · mass {spring[s].mass}
          </Label>
        </View>
      ))}
    </Section>
  );
}

function HapticsSection() {
  const events: HapticEvent[] = ['add', 'increment', 'select', 'success', 'error'];
  return (
    <Section title="Haptics" note="Mapped per interaction (ADR-136). Feel them on a real device.">
      <Row>
        {events.map((e) => (
          <Button key={e} title={e} variant="secondary" onPress={() => haptic(e)} />
        ))}
      </Row>
    </Section>
  );
}

function ButtonsSection() {
  const [loading, setLoading] = useState(false);
  return (
    <Section title="Buttons" note="Press scale + selection haptic. Min 48dp.">
      <Row>
        <Button title="Primary" onPress={() => {}} />
        <Button title="Secondary" variant="secondary" onPress={() => {}} />
        <Button title="Ghost" variant="ghost" onPress={() => {}} />
        <Button title="Destructive" variant="destructive" icon={Trash} onPress={() => {}} />
      </Row>
      <Row>
        <Button title="Large with icon" size="lg" icon={ArrowRight} onPress={() => {}} />
        <Button title="Disabled" disabled onPress={() => {}} />
        <Button
          title="Tap to load"
          loading={loading}
          onPress={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
          }}
        />
      </Row>
      <Label>IconButton: ghost · tonal · filled · surface · disabled</Label>
      <Row>
        <IconButton icon={Search} accessibilityLabel="Search" />
        <IconButton icon={Heart} variant="tonal" accessibilityLabel="Save" />
        <IconButton icon={Plus} variant="filled" accessibilityLabel="Add" />
        <IconButton icon={ShoppingCart} variant="surface" accessibilityLabel="Cart" />
        <IconButton icon={Heart} disabled accessibilityLabel="Save (disabled)" />
      </Row>
    </Section>
  );
}

function InputsSection() {
  const [q, setQ] = useState('');
  return (
    <Section title="Inputs & search">
      <Input label="Full name" placeholder="Your name" helper="As it should appear on deliveries" />
      <Input label="Pincode" placeholder="6 digits" keyboardType="number-pad" icon={Search} />
      <Input label="Phone" value="12345" error="Enter a valid 10-digit mobile number" />
      <Input label="Disabled" value="Read only" editable={false} />
      <SearchBar onPress={() => {}} />
      <SearchBar value={q} onChangeText={setQ} />
    </Section>
  );
}

function ChipsBadgesSection() {
  const [selected, setSelected] = useState('All');
  return (
    <Section
      title="Chips & badges"
      note="Badge colour rules: discount = offer only, points = loyalty only, saffron with ink text."
    >
      <Row>
        {['All', 'Under ₹99', 'Organic', 'Offers'].map((c) => (
          <Chip key={c} label={c} selected={selected === c} onPress={() => setSelected(c)} />
        ))}
        <Chip label="Disabled" disabled />
      </Row>
      <Row>
        <Badge tone="discount" label="18% OFF" />
        <Badge tone="points" label="+12 pts" />
        <Badge tone="accent" label="New" />
        <Badge tone="primary" label="Bestseller" />
        <Badge tone="neutral" label="Veg" icon={Sparkles} />
      </Row>
    </Section>
  );
}

function CommerceSection() {
  const catalog = useCatalog();
  const home = useHome();
  const [qty, setQty] = useState(0);
  const sample =
    catalog.data?.products.find((p) => p.variants.length > 1) ?? catalog.data?.products[0];
  const second = catalog.data?.products[3];
  return (
    <Section title="Commerce" note="Real seed data from Supabase where available.">
      <Label>PriceTag sm / md / lg, no discount, with Vivo price</Label>
      <PriceTag pricePaise={9900} mrpPaise={12000} size="sm" />
      <PriceTag pricePaise={9900} mrpPaise={12000} />
      <PriceTag pricePaise={47900} mrpPaise={56000} size="lg" />
      <PriceTag pricePaise={4500} mrpPaise={4500} />
      <PriceTag pricePaise={9900} mrpPaise={12000} memberPricePaise={9400} />

      <Label>AddStepper: interactive · at max (3) · sold out · large</Label>
      <Row>
        <AddStepper
          quantity={qty}
          max={3}
          onAdd={() => setQty(1)}
          onIncrement={() => setQty(qty + 1)}
          onDecrement={() => setQty(qty - 1)}
        />
        <AddStepper
          quantity={3}
          max={3}
          onAdd={() => {}}
          onIncrement={() => {}}
          onDecrement={() => {}}
        />
        <AddStepper
          quantity={0}
          disabled
          onAdd={() => {}}
          onIncrement={() => {}}
          onDecrement={() => {}}
        />
      </Row>
      <AddStepper
        size="lg"
        quantity={qty}
        max={3}
        onAdd={() => setQty(1)}
        onIncrement={() => setQty(qty + 1)}
        onDecrement={() => setQty(qty - 1)}
      />

      <Label>ProductCard grid + rail (adds to the real local cart)</Label>
      {sample && second ? (
        <Row wrap={false}>
          <View style={styles.flex}>
            <ProductCard product={sample} />
          </View>
          <View style={styles.flex}>
            <ProductCard product={second} />
          </View>
        </Row>
      ) : (
        <RailSkeleton />
      )}
      {sample ? <ProductCard product={sample} variant="rail" /> : null}

      <Label>CategoryTile · SectionHeader · ShoppingListCard</Label>
      <Row wrap={false}>
        {['fruits-vegetables', 'dairy-bakery', 'beverages', 'home-care'].map((slug) => (
          <View key={slug} style={styles.flex}>
            <CategoryTile name={slug.split('-')[0]!} slug={slug} onPress={() => {}} />
          </View>
        ))}
      </Row>
      <SectionHeader title="Section header" onAction={() => {}} />
      <ShoppingListCard />

      <Label>BannerCarousel (from the banners table)</Label>
      <View style={styles.bleed}>
        <BannerCarousel banners={home.data?.banners} loading={home.isPending} />
      </View>
    </Section>
  );
}

function NumbersSection() {
  const [n, setN] = useState(7);
  const [paise, setPaise] = useState(24900);
  const [points, setPoints] = useState(120);
  return (
    <Section
      title="Numbers"
      note="Rolling digits (fixed-width cells), count-up currency, points sheen on change."
    >
      <Row>
        <RollingNumber value={n} variant="price" />
        <Button title="−1" variant="secondary" onPress={() => setN(Math.max(0, n - 1))} />
        <Button title="+1" variant="secondary" onPress={() => setN(n + 1)} />
        <Button title="+19" variant="secondary" onPress={() => setN(n + 19)} />
      </Row>
      <Row>
        <AnimatedPrice paise={paise} variant="priceLarge" />
        <Button
          title="Random"
          variant="secondary"
          onPress={() => setPaise(Math.round(Math.random() * 300000))}
        />
      </Row>
      <Row>
        <PointsBadge points={points} />
        <Button title="+50 points" variant="secondary" onPress={() => setPoints(points + 50)} />
      </Row>
    </Section>
  );
}

function FeedbackSection() {
  const toast = useToast();
  return (
    <Section title="Feedback" note="Skeletons match real layouts; shimmer runs on the UI thread.">
      <Row wrap={false}>
        <Skeleton width={72} height={72} radius={radius.card} />
        <View style={[styles.flex, styles.gapXs]}>
          <Skeleton width="80%" height={16} />
          <Skeleton width="55%" height={12} />
          <Skeleton width="35%" height={12} />
        </View>
      </Row>
      <Row>
        <Button
          title="Info toast"
          variant="secondary"
          onPress={() => toast.show('Saved to your list')}
        />
        <Button
          title="Success toast"
          variant="secondary"
          onPress={() => toast.show('Added to cart', 'success')}
        />
        <Button
          title="Error toast"
          variant="secondary"
          onPress={() => toast.show('Out of stock', 'error')}
        />
      </Row>
      <EmptyState
        title="Nothing here yet"
        message="Empty states get an icon, a line of copy and one action."
        actionLabel="Browse"
        onAction={() => {}}
      />
      <ErrorState onRetry={() => toast.show('Retrying…')} />
      <OfflineBanner forceVisible />
    </Section>
  );
}

function InteractionsSection() {
  const { colors } = useTheme();
  const { fly } = useFlyToCart();
  const fromRef = useRef<View>(null);
  const targetRef = useRef<View>(null);
  useCartTarget(targetRef);
  const [check, setCheck] = useState(0);
  const [burst, setBurst] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [staggerKey, setStaggerKey] = useState(0);
  const [subtotal, setSubtotal] = useState(30000);
  const resetCelebration = () => useSessionStore.setState({ freeDeliveryCelebrated: false });
  const catalog = useCatalog();
  const image = catalog.data?.products[0]?.images[0] ?? null;

  return (
    <Section title="Signature interactions" note="Each one replays on tap.">
      <Label>2 · Fly-to-cart (from the tile to the cart icon)</Label>
      <Row wrap={false}>
        <View
          ref={fromRef}
          collapsable={false}
          style={[styles.flyFrom, { backgroundColor: colors.surfaceTint }]}
        />
        <Button title="Fly" icon={ArrowRight} onPress={() => fly(fromRef, image)} />
        <View
          ref={targetRef}
          collapsable={false}
          style={[styles.flyTarget, { backgroundColor: colors.surfaceTint }]}
        >
          <ShoppingCart size={24} color={colors.primary} />
        </View>
      </Row>

      <Label>4 · Free-delivery progress + once-per-session burst</Label>
      <FreeDeliveryProgress subtotalPaise={subtotal} thresholdPaise={49900} celebrate />
      <Row>
        <Button title="+₹100" variant="secondary" onPress={() => setSubtotal(subtotal + 10000)} />
        <Button
          title="Reset"
          variant="ghost"
          onPress={() => {
            setSubtotal(30000);
            resetCelebration();
          }}
        />
      </Row>

      <Label>9 · Staggered fade-up (first load only; replay uses a new list key)</Label>
      <Row>
        {Array.from({ length: 6 }, (_, i) => (
          <FadeUpOnce key={`${staggerKey}-${i}`} listKey={`lab-${staggerKey}`} index={i}>
            <View style={[styles.staggerBox, { backgroundColor: colors.surfaceTint }]} />
          </FadeUpOnce>
        ))}
      </Row>
      <Button
        title="Replay stagger"
        variant="secondary"
        onPress={() => setStaggerKey(staggerKey + 1)}
      />

      <Label>10 · Pull-to-refresh leaf (shown while refreshing)</Label>
      <Row>
        <LeafRefresh refreshing={refreshing} />
        <Button
          title={refreshing ? 'Stop' : 'Refresh'}
          variant="secondary"
          onPress={() => setRefreshing(!refreshing)}
        />
      </Row>

      <Label>11 · Success checkmark (SVG stroke)</Label>
      <Row>
        <SuccessCheck replayKey={check} />
        <Button title="Replay" variant="secondary" onPress={() => setCheck(check + 1)} />
      </Row>

      <Label>Celebration burst</Label>
      <View style={styles.burstBox}>
        <Celebration trigger={burst} />
        <Button
          title="Burst"
          variant="secondary"
          onPress={() => {
            haptic('success');
            setBurst(burst + 1);
          }}
        />
      </View>
      <Label>
        1 Add→stepper, 3 CartBar, 5 collapsing header, 6 carousel, 7 card→detail, 8 skeletons, 12
        points sheen: see Commerce, Numbers and the Home screen.
      </Label>
    </Section>
  );
}

function SheetSection() {
  const ref = useRef<SheetRef>(null);
  const { open } = useVariantSelector();
  const catalog = useCatalog();
  const multi = catalog.data?.products.find((p) => p.variants.length > 1);
  return (
    <Section title="Bottom sheets" note="@gorhom/bottom-sheet, radius 28, dynamic height.">
      <Row>
        <Button title="Open sheet" onPress={() => ref.current?.present()} />
        {multi ? (
          <Button
            title="Variant selector"
            variant="secondary"
            onPress={() =>
              open({ product: multi, selectedId: multi.variants[0]!.id, onSelect: () => {} })
            }
          />
        ) : null}
      </Row>
      <Sheet ref={ref} title="Sort by">
        {['Relevance', 'Price: low to high', 'Price: high to low', 'Discount'].map((s) => (
          <Chip key={s} label={s} onPress={() => ref.current?.dismiss()} />
        ))}
      </Sheet>
    </Section>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, gap: spacing.lg },
  intro: { gap: spacing.sm, paddingVertical: spacing.md },
  section: { gap: spacing.sm },
  sectionBody: { gap: spacing.md, marginTop: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wrap: { flexWrap: 'wrap' },
  flex: { flex: 1 },
  center: { alignItems: 'center', gap: spacing.xs },
  gapXs: { gap: spacing.xs },
  bleed: { marginHorizontal: -spacing.lg },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: '30%', gap: 2 },
  swatchColor: { height: 40, borderRadius: radius.badge, borderWidth: StyleSheet.hairlineWidth },
  pair: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.badge,
    gap: spacing.sm,
  },
  typeRow: { gap: 2 },
  shapeBox: { width: 64, height: 64 },
  springRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  springTrack: { flex: 1, height: 24, justifyContent: 'center' },
  springDot: { width: 24, height: 24, borderRadius: 12 },
  flyFrom: { width: 56, height: 56, borderRadius: radius.image },
  flyTarget: {
    width: 56,
    height: 56,
    borderRadius: radius.image,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  staggerBox: { width: 44, height: 44, borderRadius: radius.badge },
  burstBox: { height: 160, alignItems: 'center', justifyContent: 'center' },
});
