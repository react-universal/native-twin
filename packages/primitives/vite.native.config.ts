import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      mainFields: ['module', 'main'],
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: '@universal-labs/core',
      fileName: (format) => `index.${format}.native.js`,
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
        'react-native-svg',
        'react/jsx-runtime',
        /tailwindcss/,
      ],
      output: {
        dir: 'build',
        format: 'esm',
        externalImportAssertions: true,
        globals: {
          react: 'React',
          'react-dom': 'ReactDom',
        },
      },
    },
    emptyOutDir: false,
  },
});
