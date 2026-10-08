import { Image } from 'expo-image';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Banner } from '@/features/catalog/api/home';
import { radius, shadow, spacing, useMotionPreference, useTheme } from '@/theme';

const ASPECT = 1200 / 500;
const AUTOPLAY_MS = 4500;
const RESUME_AFTER_TOUCH_MS = 3000;
const PARALLAX = 24;

type Props = { banners: Banner[] | undefined; loading?: boolean; onPress?: (b: Banner) => void };

/**
 * Signature interaction 6: snap paging, light parallax on the image layer,
 * autoplay that pauses while touched, animated pill indicator. Autoplay is a
 * timer that triggers a native scroll (no per-frame JS loop) and is disabled
 * under reduced motion.
 */
export const BannerCarousel = memo(function BannerCarousel({ banners, loading, onPress }: Props) {
  const { width: screenW } = useWindowDimensions();
  const itemW = screenW - spacing.lg * 2;
  const itemH = Math.round(itemW / ASPECT);
  const interval = itemW + spacing.md;
  const scrollX = useSharedValue(0);
  const ref = useAnimatedRef<Animated.ScrollView>();
  const { reduceMotion } = useMotionPreference();
  const [page, setPage] = useState(0);
  const pausedUntil = useRef(0);
  const count = banners?.length ?? 0;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  useEffect(() => {
    if (reduceMotion || count < 2) return;
    const id = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setPage((p) => {
        const next = (p + 1) % count;
        ref.current?.scrollTo({ x: next * interval, animated: true });
        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, interval, reduceMotion, ref]);

  const pause = useCallback(() => {
    pausedUntil.current = Number.MAX_SAFE_INTEGER;
  }, []);
  const resume = useCallback(() => {
    pausedUntil.current = Date.now() + RESUME_AFTER_TOUCH_MS;
  }, []);

  if (loading || !banners) {
    return (
      <View style={styles.pad}>
        <Skeleton width={itemW} height={itemH} radius={radius.card} />
      </View>
    );
  }
  if (count === 0) return null;

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={`Offers carousel, ${page + 1} of ${count}`}
      style={styles.wrap}
    >
      <Animated.ScrollView
        ref={ref}
        horizontal
        decelerationRate="fast"
        snapToInterval={interval}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onTouchStart={pause}
        onTouchEnd={resume}
        onScrollBeginDrag={pause}
        onMomentumScrollEnd={(e) => {
          resume();
          setPage(Math.round(e.nativeEvent.contentOffset.x / interval));
        }}
      >
        {banners.map((b, i) => (
          <BannerItem
            key={b.id}
            banner={b}
            index={i}
            width={itemW}
            height={itemH}
            interval={interval}
            scrollX={scrollX}
            parallax={!reduceMotion}
            onPress={onPress}
          />
        ))}
      </Animated.ScrollView>
      {count > 1 ? <PageIndicator count={count} scrollX={scrollX} interval={interval} /> : null}
    </View>
  );
});

function BannerItem({
  banner,
  index,
  width,
  height,
  interval,
  scrollX,
  parallax,
  onPress,
}: {
  banner: Banner;
  index: number;
  width: number;
  height: number;
  interval: number;
  scrollX: SharedValue<number>;
  parallax: boolean;
  onPress?: (b: Banner) => void;
}) {
  const { colors } = useTheme();
  const imageStyle = useAnimatedStyle(() => {
    if (!parallax) return {};
    const offset = scrollX.value - index * interval;
    return {
      transform: [
        {
          translateX: interpolate(
            offset,
            [-interval, 0, interval],
            [-PARALLAX, 0, PARALLAX],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <PressableScale
      accessibilityRole="imagebutton"
      accessibilityLabel={banner.title}
      onPress={onPress ? () => onPress(banner) : undefined}
      pressedScale={0.985}
      style={[
        styles.banner,
        { width, height, backgroundColor: colors.primaryDeep, boxShadow: shadow.md },
      ]}
    >
      <Animated.View style={[styles.parallaxLayer, imageStyle]}>
        <Image
          source={banner.imageUrl}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </PressableScale>
  );
}

function PageIndicator({
  count,
  scrollX,
  interval,
}: {
  count: number;
  scrollX: SharedValue<number>;
  interval: number;
}) {
  return (
    <View style={styles.dots} importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} index={i} scrollX={scrollX} interval={interval} />
      ))}
    </View>
  );
}

function Dot({
  index,
  scrollX,
  interval,
}: {
  index: number;
  scrollX: SharedValue<number>;
  interval: number;
}) {
  const { colors } = useTheme();
  const style = useAnimatedStyle(() => {
    const p = scrollX.value / interval;
    const dist = Math.min(Math.abs(p - index), 1);
    return {
      width: interpolate(dist, [0, 1], [20, 6]),
      opacity: interpolate(dist, [0, 1], [1, 0.35]),
    };
  });
  return <Animated.View style={[styles.dot, { backgroundColor: colors.primary }, style]} />;
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  pad: { paddingHorizontal: spacing.lg },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  banner: { borderRadius: radius.card, overflow: 'hidden' },
  parallaxLayer: { position: 'absolute', top: 0, bottom: 0, left: -PARALLAX, right: -PARALLAX },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: { height: 6, borderRadius: radius.pill },
});
