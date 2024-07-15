/** @type {import('jest').Config} */
module.exports = {
  projects: ['<rootDir>', '<rootDir>/packages/*'],
  passWithNoTests: false,
  displayName: "Root",
  watchman: false,
  verbose: true,
  preset: 'jest-expo',
  testPathIgnorePatterns: ['packages/vscode-extension/src/test/suite'],
  modulePathIgnorePatterns: ['vscode'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
