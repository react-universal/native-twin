/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      mainFields: ['module', 'main'],
      resolveExtensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.ts', '.js'],
    },
  },
  resolve: {
    extensions: ['.web.tsx', '.web.jsx', '.web.js', '.tsx', '.ts', '.js'],
    alias: {
      'react-native': 'react-native-web',
    },
    conditions: ['react-native'],
  },
  test: {
    setupFiles: ['vitest-react-native/setup'],
    environment: 'happy-dom',
    globals: true,
    env: {
      APP_ENV: 'test',
    },
    cache: {
      dir: 'test/.cache',
    },
  },
});
