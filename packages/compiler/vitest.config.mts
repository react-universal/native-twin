import 'jiti/register';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: '@twin/compiler',
    logHeapUsage: true
  },
});
