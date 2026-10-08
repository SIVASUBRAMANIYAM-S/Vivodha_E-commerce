import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { brand } from '@/theme';

/** Path data mirrors packages/shared/src/brand/logo-mark.svg (single source, ADR-123). */
export const LEAF_LEFT = 'M50 78 C 20 65 15 35 28 15 C 34 34 38 56 50 78 Z';
export const LEAF_RIGHT = 'M50 78 C 80 65 85 35 72 15 C 66 34 62 56 50 78 Z';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      accessibilityRole="image"
      accessibilityLabel="vivodha"
    >
      <Rect width={100} height={100} rx={24} fill={brand.primary} />
      <Path d={LEAF_LEFT} fill="#FFFFFF" />
      <Path d={LEAF_RIGHT} fill="#FFFFFF" fillOpacity={0.88} />
      <Circle cx={50} cy={12} r={6.5} fill={brand.saffron} />
    </Svg>
  );
}
