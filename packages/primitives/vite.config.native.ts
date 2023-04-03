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
      name: 'UniversalLabsPrimitives',
      fileName: (format) => {
        if (format === 'cjs') {
          return 'index.js';
        }
        return `index.${format}.js`;
      },
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: [
        'react',
        'react-dom',
        'react-native',
        'react-native-web',
        'class-variance-authority',
        'react/jsx-runtime',
        '@universal-labs/styled',
      ],
      output: {
        dir: 'build',
        format: 'commonjs',
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
