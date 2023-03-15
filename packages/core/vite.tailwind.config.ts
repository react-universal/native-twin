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
      entry: [
        path.resolve(__dirname, 'src/tailwind/preset/tailwind-preset.ts'),
        path.resolve(__dirname, 'src/tailwind/plugin/tailwind-plugin.ts'),
      ],
      name: '@react-universal/core/tailwind',
      formats: ['cjs'],
      fileName: (format, name) => `${name}.${format}`,
    },
    rollupOptions: {
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: ['postcss', 'postcss-js'],
      output: {
        dir: 'build',
        extend: true,
        externalImportAssertions: true,
      },
    },
    emptyOutDir: false,
    sourcemap: false,
  },
});
