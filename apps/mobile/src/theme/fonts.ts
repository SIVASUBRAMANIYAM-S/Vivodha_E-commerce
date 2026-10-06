import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import type { FontWeight, fontFamily } from '@vivodha/shared/tokens';

/** Passed to useFonts() in the root layout. */
export const fontAssets = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
};

// React Native encodes weight in the family name, so map (family, weight) -> loaded font name.
const fontNames = {
  heading: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
  body: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
} as const satisfies Record<keyof typeof fontFamily, Record<FontWeight, keyof typeof fontAssets>>;

export function fontFor(family: keyof typeof fontFamily, weight: FontWeight): string {
  return fontNames[family][weight];
}
