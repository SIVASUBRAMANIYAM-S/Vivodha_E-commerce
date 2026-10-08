import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { duration, radius, useMotionPreference, useTheme } from '@/theme';

type Rect = { x: number; y: number; width: number; height: number };
type Flight = { key: number; imageUrl: string | null; from: Rect; to: Rect };

type FlyApi = {
  /** Animate a product thumbnail from `fromRef` into the active cart target. */
  fly: (fromRef: RefObject<View | null>, imageUrl: string | null) => void;
  /** Incremented on each arrival; cart targets react with a pulse (UI thread). */
  arrivals: SharedValue<number>;
  pushTarget: (ref: RefObject<View | null>) => void;
  popTarget: (ref: RefObject<View | null>) => void;
};

const FlyContext = createContext<FlyApi | null>(null);

const THUMB = 56;

function measure(ref: RefObject<View | null>): Promise<Rect | null> {
  return new Promise((resolve) => {
    const node = ref.current;
    if (!node) return resolve(null);
    node.measureInWindow((x, y, width, height) =>
      resolve(width || height ? { x, y, width, height } : null),
    );
  });
}

/**
 * Fly-to-cart (signature interaction 2). Mounted once at the root. Screens
 * register their visible cart target (tab bar icon, header cart button) with
 * useCartTarget(); the most recently focused target wins. Reduced motion: no
 * flight, the target only pulses.
 */
export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const targets = useRef<RefObject<View | null>[]>([]);
  const arrivals = useSharedValue(0);
  const [flight, setFlight] = useState<Flight | null>(null);
  const { reduceMotion } = useMotionPreference();
  const nextKey = useRef(1);

  const pushTarget = useCallback((ref: RefObject<View | null>) => {
    targets.current = [...targets.current.filter((r) => r !== ref), ref];
  }, []);
  const popTarget = useCallback((ref: RefObject<View | null>) => {
    targets.current = targets.current.filter((r) => r !== ref);
  }, []);

  const arrive = useCallback(() => {
    arrivals.set(arrivals.get() + 1);
    setFlight(null);
  }, [arrivals]);

  const fly = useCallback(
    (fromRef: RefObject<View | null>, imageUrl: string | null) => {
      const targetRef = targets.current[targets.current.length - 1];
      if (reduceMotion || !targetRef) {
        arrivals.set(arrivals.get() + 1);
        return;
      }
      void Promise.all([measure(fromRef), measure(targetRef)]).then(([from, to]) => {
        if (!from || !to) {
          arrivals.set(arrivals.get() + 1);
          return;
        }
        setFlight({ key: nextKey.current++, imageUrl, from, to });
      });
    },
    [arrivals, reduceMotion],
  );

  const api = useMemo(
    () => ({ fly, arrivals, pushTarget, popTarget }),
    [fly, arrivals, pushTarget, popTarget],
  );

  return (
    <FlyContext.Provider value={api}>
      {children}
      {flight ? <FlightView key={flight.key} flight={flight} onArrive={arrive} /> : null}
    </FlyContext.Provider>
  );
}

function FlightView({ flight, onArrive }: { flight: Flight; onArrive: () => void }) {
  const { colors } = useTheme();
  const t = useSharedValue(0);

  const startX = flight.from.x + flight.from.width / 2 - THUMB / 2;
  const startY = flight.from.y + flight.from.height / 2 - THUMB / 2;
  const endX = flight.to.x + flight.to.width / 2 - THUMB / 2;
  const endY = flight.to.y + flight.to.height / 2 - THUMB / 2;
  // Control point above both ends gives a natural arc.
  const ctrlX = (startX + endX) / 2;
  const ctrlY = Math.min(startY, endY) - 140;

  useEffect(() => {
    t.value = withTiming(
      1,
      { duration: duration.slow + 120, easing: Easing.bezier(0.3, 0, 0.2, 1) },
      (finished) => {
        if (finished) scheduleOnRN(onArrive);
      },
    );
  }, [onArrive, t]);

  const style = useAnimatedStyle(() => {
    const p = t.value;
    const inv = 1 - p;
    // Quadratic Bézier: (1-p)^2 P0 + 2(1-p)p C + p^2 P1
    const x = inv * inv * startX + 2 * inv * p * ctrlX + p * p * endX;
    const y = inv * inv * startY + 2 * inv * p * ctrlY + p * p * endY;
    return {
      transform: [{ translateX: x }, { translateY: y }, { scale: 1 - 0.6 * p }],
      opacity: p > 0.85 ? (1 - p) / 0.15 : 1,
    };
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.thumb,
          { backgroundColor: colors.surfaceTint, borderColor: colors.surface },
          style,
        ]}
      >
        {flight.imageUrl ? (
          <Image source={flight.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : null}
      </Animated.View>
    </View>
  );
}

export function useFlyToCart(): FlyApi {
  const ctx = useContext(FlyContext);
  if (!ctx) throw new Error('useFlyToCart must be used inside <FlyToCartProvider>');
  return ctx;
}

/** Registers `ref` as the fly-to-cart destination while its screen is focused. */
export function useCartTarget(ref: RefObject<View | null>) {
  const { pushTarget, popTarget } = useFlyToCart();
  useFocusEffect(
    useCallback(() => {
      pushTarget(ref);
      return () => popTarget(ref);
    }, [popTarget, pushTarget, ref]),
  );
}

const styles = StyleSheet.create({
  thumb: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: radius.image,
    borderWidth: 2,
    overflow: 'hidden',
  },
});
