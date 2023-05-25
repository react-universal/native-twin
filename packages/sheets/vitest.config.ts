/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    // plugin adds this condition automatically
    conditions: ['react-native'],
  },
  test: {
    setupFiles: ['vitest-react-native/setup'],
    ui: true,
    api: true,
    // this is required for this plugin to work
    globals: true,
    benchmark: {
      reporters: 'json',
      outputFile: path.join(__dirname, './benchmark/results.json'),
    },
    env: {
      APP_ENV: 'test',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      mainFields: ['module', 'main'],
    },
  },
});
