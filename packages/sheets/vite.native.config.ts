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
      fileName: (format) => `index.native.${format}.js`,
    },
    rollupOptions: {
      external: [
        'css-to-react-native',
        'react-native',
        'react-native-web',
        'immer',
        '@universal-labs/core',
        '@universal-labs/core/tailwind/preset',
      ],
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      treeshake: true,
      output: {
        format: 'esm',
        dir: 'build',
        extend: true,
        externalImportAssertions: true,
      },
    },
    emptyOutDir: false,
  },
});
