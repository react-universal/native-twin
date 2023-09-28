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
        tailwind: path.resolve(__dirname, 'src/tailwind/index.ts'),
        parser: path.resolve(__dirname, 'src/parser-module.ts'),
      },
      name: 'UniversalLabsCss',
      fileName: (format, name) => {
        if ((name == 'tailwind' || name == 'parser') && format == 'cjs') {
          return `${name}.${format}`;
        }
        return `${name}.${format}.js`;
      },
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
