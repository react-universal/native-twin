/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    conditions: ['react-native'],
  },
  test: {
    setupFiles: ['vitest-react-native/setup'],
    deps: {
      external: ['react-native'],
    },
    globals: true,
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
