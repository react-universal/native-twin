/** @type {import('jest').Config} */
module.exports = {
  testPathIgnorePatterns: ['src/*', 'build/*'],
  testEnvironment: 'jsdom',
  passWithNoTests: true,
};
