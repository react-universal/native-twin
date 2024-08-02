/** @type {import("jest").Config} */
module.exports = {
  preset: 'jest-expo/ios',
  setupFilesAfterEnv: [
    './src/testing-library/setup.ts',
    './src/testing-library/setupAfterEnv.ts',
  ],
  watchPathIgnorePatterns: ["./build/*"],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
