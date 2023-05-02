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
    deps: {
      inline: ['react-native'],
    },
    // this is required for this plugin to work
    globals: true,
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
