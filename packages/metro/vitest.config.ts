import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 100000,
    // root: path.join(__dirname, '../..'),
  },
});
