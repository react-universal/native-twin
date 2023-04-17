import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      minify: true,
      mainFields: ['module', 'main'],
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src-old/tailwind/preset/tailwind-preset.ts'),
      name: '@react-universal/core/tailwind/preset',
      formats: ['cjs', 'es'],
      fileName: (format, name) => `${name}.${format}.js`,
    },
    terserOptions: {
      mangle: false,
    },
    minify: 'terser',
    rollupOptions: {
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: ['postcss', 'postcss-js'],
      output: {
        dir: 'build',
        esModule: true,
        extend: true,
        externalImportAssertions: true,
      },
    },
    emptyOutDir: false,
    sourcemap: false,
  },
});
