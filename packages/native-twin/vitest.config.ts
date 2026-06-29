import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: path.join(__dirname, '../../')
    // root: path.join(__dirname, '../..'),
  },
});
