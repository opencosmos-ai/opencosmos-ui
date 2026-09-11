import tseslint from 'typescript-eslint';

export default tseslint.config(
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  {
    ignores: ['dist/**', 'node_modules/**'],
  },
);
