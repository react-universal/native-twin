/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/tailwind-adapter',

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
    lib: {
      entry: 'src/index.ts',
      name: 'tailwind-adapter',
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
        extend: true,
        externalImportAssertions: true,
      },
    },
  },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
