/// <reference types="vitest" />
import terser from '@rollup/plugin-terser';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  test: {},
  plugins: [],
  build: {
    reportCompressedSize: true,
    chunkSizeWarningLimit: 300,
    ssr: false,
    lib: {
      entry: path.resolve(__dirname, 'src/builds/module.ts'),
      name: '@universal-labs/tailwind-postcss-adapter',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'es'],
    },
    minify: 'terser',
    terserOptions: {
      ie8: true,
      mangle: {
        properties: {
          debug: true,
          keep_quoted: true,
          regex: '1.5',
        },
      },
      compress: true,
      ecma: 2015,
    },
    rollupOptions: {
      plugins: [terser()],
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
        dir: 'build',
        extend: true,
        externalImportAssertions: true,
        esModule: true,
      },
    },
    emptyOutDir: false,
  },
});
