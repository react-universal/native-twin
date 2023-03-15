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
  build: {
    reportCompressedSize: true,
    ssr: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'stylesheets',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'es', 'umd', 'iife'],
    },
    rollupOptions: {
      external: [
        'postcss',
        'postcss-css-variables',
        'css-to-react-native',
        'postcss-js',
        'react',
        'react/jsx-runtime',
        'react-native',
        'react-native-web',
        'immer',
        'postcss-color-rgb',
        '@universal-labs/core',
        '@universal-labs/core/tailwind/preset',
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
