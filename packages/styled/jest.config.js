const jestExpo = require("jest-expo/jest-preset");

/** @type {import("jest").Config} */
module.exports = {
  ...jestExpo,
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: ["build/", ".*/_[a-zA-Z]"],
  
  // watchPathIgnorePatterns: ['test/fixtures/*', 'test/node_modules/*', 'build/*/*.js'],
  // transformIgnorePatterns: [
  //   'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  // ],
};
