module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 90,
  tabWidth: 2,
  jsxSingleQuote: true,
  bracketSpacing: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrderParserPlugins: [
    'classProperties',
    '["decorators", { "decoratorsBeforeExport": true }]',
    'typescript',
    'jsx',
  ],
  importOrder: [
    'expo/build/Expo.fx',
    'react-native-gesture-handler',
    '^(react|react-native)$',
    '<THIRD_PARTY_MODULES>',
    '^@native-twin/(.*)$',
    '^[./]',
  ],
};
