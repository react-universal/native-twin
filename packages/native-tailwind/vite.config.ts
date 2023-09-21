import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: path.resolve(__dirname, 'src'),
      outputDir: 'build',
      insertTypesEntry: true,
      skipDiagnostics: false,
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
    reportCompressedSize: true,
    chunkSizeWarningLimit: 300,
    minify: 'esbuild',
    ssr: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: '@universal-labs/tailwind',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      shimMissingExports: true,
      strictDeprecations: true,
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      treeshake: true,
      external: [
        'react-native',
        '@universal-labs/css',
        'react',
        'react/jsx-runtime',
        'react-native-web',
      ],
      output: {
        dir: 'build',
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
