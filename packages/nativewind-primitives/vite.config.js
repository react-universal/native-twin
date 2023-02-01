import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      plugins: [['@swc/plugin-styled-components', {}]],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: '@react-universal/nativewind-primitives',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-native',
        'react-native-web',
        'postcss',
        'class-variance-authority',
        'clsx',
        'react-native-svg',
        '@react-universal/nativewind-utils',
        'nativewind',
        'react/jsx-runtime',
      ],
      output: {
        dir: 'build',
        format: 'esm',
        globals: {
          react: 'React',
          'react-dom': 'ReactDom',
        },
      },
    },
    emptyOutDir: true,
    sourcemap: false,
  },
});
