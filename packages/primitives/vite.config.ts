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
      outputDir: 'build/typings',
    }),
  ],
  esbuild: {
    keepNames: true,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UniversalLabsPrimitives',
      fileName: (format) => `${format}/index.native.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: [
        'react',
        'react-dom',
        'react-native',
        'react-native-web',
        'react/jsx-runtime',
        '@universal-labs/styled',
      ],
      treeshake: true,
      output: {
        dir: 'build',
        externalImportAssertions: true,
        extend: true,
        globals: {
          react: 'React',
          'react-native': 'ReactNative',
          'react-native-web': 'ReactNativeWeb',
          'react/jsx-runtime': 'ReactJsxRuntime',
          '@universal-labs/styled': 'UniversalLabsStyled',
        },
      },
    },
  },
});
