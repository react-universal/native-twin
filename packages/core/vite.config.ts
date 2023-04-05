/// <reference types="vitest" />
// Configure Vitest (https://vitest.dev/config/)
import path, { join } from 'path';
import { defineConfig } from 'vite';
import multiple from 'vite-plugin-multiple';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {},
  plugins: [
    multiple([
      {
        name: 'tailwind',
        config: join(__dirname, 'vite.config.tailwind.ts'),
        command: 'build',
      },
    ]),
    // Plugin for .d.ts files
    viteTsConfigPaths({
      root: '../../',
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      minify: true,
      mainFields: ['module', 'main'],
    },
  },
  esbuild: {
    logLevel: 'info',
    define: {
      'process.env.DEBUG': 'undefined',
      'process.env.JEST_WORKER_ID': '1',
      __dirname: '"/"',
    },
    supported: {
      'nullish-coalescing': false,
      'optional-chain': false,
    },
  },
  build: {
    outDir: 'build',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 300,
    ssr: false,
    lib: {
      entry: path.resolve(__dirname, 'src/builds/module.ts'),
      name: '@universal-labs/core',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      shimMissingExports: true,
      external: [
        'postcss',
        'postcss-css-variables',
        'css-to-react-native',
        'postcss-js',
        'postcss-color-rgb',
      ],
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      treeshake: true,
      output: {
        extend: true,
        externalImportAssertions: true,
      },
    },
    emptyOutDir: false,
  },
});
