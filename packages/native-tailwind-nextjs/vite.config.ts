import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const production = process.argv[2] === '--production';

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: path.resolve(__dirname, 'src'),
      outDir: 'build',
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
    reportCompressedSize: true,
    chunkSizeWarningLimit: 300,
    minify: 'esbuild',
    ssr: false,
    lib: {
      entry: {
        _app: path.resolve(__dirname, 'src/_app.ts'),
        _document: path.resolve(__dirname, 'src/_document.ts'),
      },
      name: '@universal-labs/native-tw-nextjs',
      fileName: (format, name) => `${name}.${format}.js`,
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
        '@universal-labs/native-tw',
        'next',
        'next/app',
        'next/document',
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
    emptyOutDir: !!production,
  },
});
