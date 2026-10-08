// https://docs.expo.dev/guides/using-eslint/
import { vivodhaRules } from '@vivodha/config/eslint/base';
import expoConfig from 'eslint-config-expo/flat.js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  expoConfig,
  ...vivodhaRules,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/components/icons.ts'],
    rules: {
      // Metro doesn't tree-shake barrels: importing values from 'lucide-react-native'
      // bundles all ~3,700 icons. Add icons to src/components/icons.ts instead.
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-react-native',
              message:
                "Import icons from '@/components/icons' (deep imports keep the bundle lean).",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  { ignores: ['dist/*', '.expo/*', 'expo-env.d.ts'] },
]);
