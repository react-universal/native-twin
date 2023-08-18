import terser from '@rollup/plugin-terser';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      entryRoot: path.resolve(__dirname, 'src'),
      outputDir: 'build',
      insertTypesEntry: true,
      skipDiagnostics: true,
    }),
  ],
  build: {
    reportCompressedSize: true,
    chunkSizeWarningLimit: 300,
    ssr: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: '@universal-labs/twind-adapter',
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
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      treeshake: true,
      external: ['react-native', '@twind/core', 'react-native-web'],
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
