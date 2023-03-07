import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      plugins: [['@swc/plugin-styled-components', {}]],
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      mainFields: ['module', 'main'],
      // resolveExtensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.ts', '.js'],
    },
  },
  // resolve: {
  //   extensions: ['.web.tsx', '.web.jsx', '.web.js', '.tsx', '.ts', '.js'],
  //   alias: {
  //     'react-native': 'react-native-web',
  //   },
  // },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: [
        path.resolve(__dirname, 'src/index.ts'),
        path.resolve(__dirname, 'src/primitives.ts'),
      ],
      name: 'react-universal',
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      // makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: [
        // '@react-universal/core',
        'react',
        'react-dom',
        'react-native',
        'react-native-web',
        'postcss',
        'postcss-js',
        'react/jsx-runtime',
        /next/,
      ],
      output: {
        dir: 'build',
        format: 'esm',
        externalImportAssertions: true,
        globals: {
          react: 'React',
          'react-dom': 'ReactDom',
          next: 'Next',
        },
      },
    },
    sourcemap: true,
  },
});
