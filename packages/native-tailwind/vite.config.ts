import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      entryRoot: path.resolve(__dirname, 'src'),
      outDir: 'build',
      insertTypesEntry: true,
      logLevel: 'error',
    }),
  ],
  build: {
    reportCompressedSize: true,
    chunkSizeWarningLimit: 10,
    outDir: 'build',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: '@universal-labs/native-twin',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      shimMissingExports: true,
      strictDeprecations: true,
      treeshake: true,
      external: [
        'react-native',
        'react',
        'react/jsx-runtime',
        'react-native-web',
        '@universal-labs/css',
      ],
      output: {
        compact: true,
      },
    },

    emptyOutDir: false,
  },
});
