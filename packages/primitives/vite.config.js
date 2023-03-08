import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
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
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'primitives',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: [
        'react',
        '@expo/html-elements',
        'react-dom',
        'react-native',
        'react-native-web',
        'class-variance-authority',
        '@universal-labs/core',
        '@universal-labs/styled',
        'react-native-svg',
        'react/jsx-runtime',
        /tailwindcss/,
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
