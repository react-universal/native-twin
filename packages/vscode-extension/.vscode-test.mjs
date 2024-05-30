import { defineConfig } from '@vscode/test-cli';
import os from 'os';

export default defineConfig({
  files: 'build/test/**/*.test.js',
  workspaceFolder: 'project-fixture',
  desktopPlatform: 'darwin-arm64',
  launchArgs: ['--user-data-dir', `${os.tmpdir()}`],
  mocha: {
    ui: 'tdd',
    timeout: 20000,
  },
});
