import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      minify: true,
    },
  },
  build: {
    outDir: 'build',
    lib: {
      entry: path.resolve(__dirname, 'src/tailwind/preset/tailwind-preset.ts'),
      name: 'tailwind-preset',
      formats: ['cjs'],
      fileName: (format, name) => `${name}.${format}.js`,
    },
    rollupOptions: {
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: ['postcss', 'postcss-js'],
      output: {
        esModule: true,
        extend: true,
        externalImportAssertions: true,
      },
    },
    emptyOutDir: false,
    sourcemap: false,
  },
});
