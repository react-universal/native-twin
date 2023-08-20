import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    // Plugin for .d.ts files
    dts({
      entryRoot: path.resolve(__dirname, 'src'),
      outputDir: 'build',
      insertTypesEntry: true,
    }),
  ],
  esbuild: {
    treeShaking: true,
    minifyWhitespace: true,
    minifySyntax: true,
    minifyIdentifiers: true,
    legalComments: 'none',
  },
  build: {
    minify: 'esbuild',
    outDir: 'build',
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        parser: path.resolve(__dirname, 'src/parser-module.ts'),
      },
      name: 'UniversalLabsCss',
      fileName: (format, name) =>
        name == 'parser' && format == 'cjs' ? `${name}.${format}` : `${name}.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      strictDeprecations: true,
      external: ['react-native', 'react'],
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      treeshake: true,
      output: {
        generatedCode: {
          arrowFunctions: true,
          constBindings: true,
          objectShorthand: true,
          preset: 'es2015',
        },
        interop: 'auto',
        compact: true,
      },
    },
    emptyOutDir: false,
  },
});
