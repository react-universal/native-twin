/** @type {typeof import('eslint/conf/eslint-all')} **/
module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    commonjs: true,
    node: true,
  },
  ignorePatterns: ['**/node_modules/**/*', '**/build/**/*'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:prettier/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    route: 'readonly',
    __DEV__: 'readonly',
  },
  settings: {
    'import/ignore': ['react-native'],
    react: {
      version: 'detect',
    },
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'unused-imports', '@nrwl/nx'],
  rules: {
    '@nrwl/nx/enforce-module-boundaries': ['error', {}],
    'react/no-children-prop': 'off',
    'no-console': 'warn',
    'no-redeclare': 'off',
    'no-undef': 'off',
    'no-useless-escape': 'off',
    'no-unused-vars': 'off',
    'react/no-unescaped-entities': 'off',
    'react-hooks/rules-of-hooks': 'error',
    '@typescript-eslint/no-import-type-side-effects': 'error',
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks:
          '(useMotiPressableTransition|useMotiPressable|useMotiPressables|useMotiPressableAnimatedProps|useInterpolateMotiPressable)',
      },
    ],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-target-blank': 'off',
    'react/prop-types': 'off',
    'unused-imports/no-unused-imports': 'error',
    'no-sparse-arrays': 'off',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    'no-empty': 'warn',
    'react/display-name': 'warn',
    'no-async-promise-executor': 'warn',
  },
  reportUnusedDisableDirectives: true,
};
