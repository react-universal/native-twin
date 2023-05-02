/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    // plugin adds this condition automatically
    conditions: ['react-native'],
    alias: {
      'react-native': 'react-native-web',
    },
  },
  test: {
    exclude: ['**/node_modules/**', '**/build/**'],
    dangerouslyIgnoreUnhandledErrors: true,
    // this is required for this plugin to work
    setupFiles: ['vitest-react-native/setup'],
    globals: true,
    deps: {
      inline: ['react-native'],
    },
    env: {
      APP_ENV: 'test',
    },
  },
  build: {
    rollupOptions: {
      external: ['react-native'],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      mainFields: ['module', 'main'],
    },
  },
});
