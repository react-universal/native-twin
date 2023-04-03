import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: path.resolve(__dirname, 'src'),
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      mainFields: ['module', 'main'],
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UniversalLabsStyled',
      fileName: (format) => {
        if (format === 'cjs') {
          return 'index.js';
        }
        return `index.${format}.js`;
      },
      formats: ['cjs', 'es', 'umd', 'iife'],
    },
    rollupOptions: {
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: [
        'react',
        'react-native',
        'react-native-web',
        'react/jsx-runtime',
        '@universal-labs/stylesheets',
        'tailwind-merge',
      ],
      treeshake: true,
      output: {
        dir: 'build',
        format: 'esm',
        extend: true,
        externalImportAssertions: true,
        globals: {
          react: 'React',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react-native': 'ReactNative',
          'react-native-web': 'ReactNativeWeb',
          '@universal-labs/stylesheets': 'UniversalLabsStylesheets',
          'tailwind-merge': 'tailwindMerge',
        },
      },
    },
    outDir: 'build',
    emptyOutDir: false,
    sourcemap: false,
  },
});
