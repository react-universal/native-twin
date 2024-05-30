/** @type {import('jest').Config} */
module.exports = {
  projects: ['<rootDir>/packages/*'],
  passWithNoTests: true,
  watchman: false,
  preset: 'jest-expo/ios',
  testPathIgnorePatterns: ['packages/vscode-extension/src/test/suite'],
  modulePathIgnorePatterns: ['vscode']
};
