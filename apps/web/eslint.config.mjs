import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Matches the posture in packages/ui/eslint.config.mjs: correctness rules
      // error, style and hygiene rules warn.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-empty-object-type': 'off',
      // Apostrophes and quotes in JSX prose. Purely a source-legibility rule —
      // it has no correctness, rendering, or accessibility impact, and `&apos;`
      // makes copy harder to edit than the character it replaces.
      'react/no-unescaped-entities': 'warn',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
];
