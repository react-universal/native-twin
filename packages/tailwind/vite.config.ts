/// <reference types="vitest" />
// Configure Vitest (https://vitest.dev/config/)
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  test: {},
  plugins: [],
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
    platform: 'browser',
  },
  logLevel: 'info',
  build: {
    reportCompressedSize: true,
    ssr: false,
    lib: {
      entry: path.resolve(__dirname, 'src/builds/module.ts'),
      name: '@react-universal/tailwind',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'es', 'umd', 'iife'],
    },
    rollupOptions: {
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
        dir: 'build',
        extend: true,
        externalImportAssertions: true,
      },
    },
  },
});
