/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    conditions: ['react-native'],
  },
  test: {
    setupFiles: ['vitest-react-native/setup'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
    // this is required for this plugin to work
    globals: true,
    benchmark: {
      reporters: 'json',
      outputFile: path.join(__dirname, './benchmark/results.json'),
    },
    env: {
      APP_ENV: 'test',
    },
    cache: {
      dir: 'test/.cache',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      mainFields: ['module', 'main'],
    },
  },
});
