import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  keepNames: true,
  dts: true,
  format: ['cjs', 'esm'],
  globalName: 'ArcParser',
  outDir: 'build',
  platform: 'neutral',
});
