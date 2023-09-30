import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import multiple from 'vite-plugin-multiple';

export default defineConfig({
  plugins: [
    multiple([
      {
        name: 'web',
        config: 'vite.config.web.ts',
        command: 'build',
      },
    ]),
    // Plugin for react related libs
    react(),
    // Plugin for .d.ts files
    dts({
      entryRoot: path.resolve(__dirname, 'src'),
      outputDir: 'build',
    }),
  ],
  build: {
    outDir: 'build',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UniversalLabsStyled',
      fileName: () => 'index.js',
      formats: ['es'],
    },
    rollupOptions: {
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: [
        'react',
        'react-native',
        'react-native-web',
        'react-is',
        'react/jsx-runtime',
        '@universal-labs/css',
        '@universal-labs/native-tw',
      ],
      treeshake: true,
      output: {
        externalImportAssertions: true,
        globals: {
          react: 'React',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react-native': 'ReactNative',
          'react-native-web': 'ReactNativeWeb',
          '@universal-labs/css': 'UniversalLabsCss',
          '@universal-labs/native-tw': 'UniversalLabsTailwind',
        },
      },
    },
    emptyOutDir: false,
  },
});
