// https://docs.expo.dev/guides/using-eslint/
import { vivodhaRules } from '@vivodha/config/eslint/base';
import expoConfig from 'eslint-config-expo/flat.js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  expoConfig,
  ...vivodhaRules,
  { ignores: ['dist/*', '.expo/*', 'expo-env.d.ts'] },
]);
