/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
  },
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
    // commonjsOptions: {
    //   transformMixedEsModules: true,
    // },
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UniversalLabsStyled',
      fileName: (format) => `${format}/index.web.js`,
      formats: ['es', 'umd'],
    },
    outDir: 'build',
    rollupOptions: {
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: ['react'],
      treeshake: true,
      output: {
        extend: true,
        globals: {
          react: 'React',
        },
        dir: 'build',
        externalImportAssertions: true,
      },
    },
    sourcemap: false,
    emptyOutDir: false,
  },
});
