/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    // plugin adds this condition automatically
  },
  test: {
    // this is required for this plugin to work
    globals: true,
    env: {
      APP_ENV: 'test',
    },
  },
});
