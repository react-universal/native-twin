import { defineConfig } from '@vscode/test-cli';
import os from 'os';
import path from 'path';

const config = defineConfig({
  files: 'build/cjs/test/**/*.test.js',
  workspaceFolder: './project-fixture',
  skipExtensionDependencies: true,
  launchArgs: ['--user-data-dir', path.join('.','.vscode-user-data')],
  mocha: {
    ui: 'tdd',
    fullTrace: true,
    timeout: 20000,
  },
});

console.log("CONF: ", config);

export default config;