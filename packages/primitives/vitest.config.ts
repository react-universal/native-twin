/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    conditions: ['react-native'],
  },
  test: {
    setupFiles: ['vitest-react-native/setup'],
    environment: 'happy-dom',
    globals: true,
    env: {
      APP_ENV: 'test',
    },
  },
});
