/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
  },
  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      mainFields: ['module', 'main'],
      resolveExtensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.ts', '.js'],
    },
  },
  resolve: {
    extensions: ['.web.tsx', '.web.jsx', '.web.js', '.tsx', '.ts', '.js'],
    alias: {
      'react-native': 'react-native-web',
    },
  },
  build: {
    outDir: 'build',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UniversalLabsPrimitives',
      fileName: (format) => `index.${format}.web.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: [
        'react',
        'react-native',
        'react-native-web',
        'react/jsx-runtime',
        '@universal-labs/styled',
      ],
      output: {
        format: 'esm',
        externalImportAssertions: true,
        globals: {
          react: 'React',
          'react-native': 'ReactNative',
          'react-native-web': 'ReactNativeWeb',
          'react/jsx-runtime': 'ReactJsxRuntime',
          '@universal-labs/styled': 'UniversalLabsStyled',
        },
      },
    },
    emptyOutDir: false,
  },
});
