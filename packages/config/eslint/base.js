// Shared ESLint flat config. Apps spread their framework preset (Next / Expo) first, then this.
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export const vivodhaRules = [
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // Must stay last: turns off stylistic rules that conflict with Prettier.
  eslintConfigPrettier,
];

/** Standalone config for plain TS packages (packages/shared). */
export const base = tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  ...tseslint.configs.recommended,
  ...vivodhaRules,
);

export default base;
