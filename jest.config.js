/** @type {import('jest').Config} */
module.exports = {
  projects: ['<rootDir>/packages/*'],
  passWithNoTests: true,
  watchman: false,
  preset: 'jest-expo/ios',
  testPathIgnorePatterns: ['packages/vscode-extension/src/test/suite'],
  modulePathIgnorePatterns: ['vscode'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
