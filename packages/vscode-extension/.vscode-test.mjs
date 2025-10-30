import { defineConfig } from '@vscode/test-cli';
import os from 'os';
console.log("sdfsdfsdfdsf");
const config = defineConfig({
  files: 'build/test/**/*.test.js',
  workspaceFolder: './project-fixture',
  desktopPlatform: 'darwin-arm64',
  launchArgs: ['--user-data-dir', `${os.tmpdir()}`],
  mocha: {
    ui: 'tdd',
    timeout: 20000,
  },
});

console.log("CONF: ", config);

export default config;