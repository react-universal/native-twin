import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    // Plugin for .d.ts files
    dts({
      entryRoot: path.resolve(__dirname, 'src'),
      outputDir: 'build',
      insertTypesEntry: false,
      logLevel: 'error',
    }),
  ],
  build: {
    outDir: 'build',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: '@universal-labs/babel-plugin',
      fileName: (format, name) => {
        return `${name}.${format}.js`;
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      strictDeprecations: true,
      external: ['react-native', 'react'],
      treeshake: true,
    },
    emptyOutDir: false,
  },
});
