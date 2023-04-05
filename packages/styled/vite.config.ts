import react from '@vitejs/plugin-react-swc';
import path, { join } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import multiple from 'vite-plugin-multiple';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    multiple([
      {
        name: 'web',
        config: join(__dirname, 'vite.config.web.ts'),
        command: 'build',
      },
    ]),
    // Plugin for react related libs
    react(),
    // Plugin for .d.ts files
    dts({
      entryRoot: 'src',
      tsConfigFilePath: join(__dirname, 'tsconfig.lib.json'),
      outputDir: 'build',
      skipDiagnostics: true,
    }),

    viteTsConfigPaths({
      root: '../../',
    }),
  ],
  build: {
    outDir: 'build',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UniversalLabsStyled',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: [
        'react',
        'react-native',
        'react-native-web',
        'react/jsx-runtime',
        '@universal-labs/stylesheets',
        'tailwind-merge',
      ],
      treeshake: true,
      output: {
        extend: true,
        externalImportAssertions: true,
        globals: {
          react: 'React',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'react-native': 'ReactNative',
          'react-native-web': 'ReactNativeWeb',
          '@universal-labs/stylesheets': 'UniversalLabsStylesheets',
          'tailwind-merge': 'tailwindMerge',
        },
      },
    },
    emptyOutDir: false,
  },
});

// const nativeConfig = getConfigForNative({
//   dirname: __dirname,
//   usesReactPlugin: true,
//   externals: [
//     'react',
//     'react-native',
//     'react-native-web',
//     'react/jsx-runtime',
//     '@universal-labs/stylesheets',
//     'tailwind-merge',
//   ],
//   globals: {
//     react: 'React',
//     'react/jsx-runtime': 'ReactJSXRuntime',
//     'react-native': 'ReactNative',
//     'react-native-web': 'ReactNativeWeb',
//     '@universal-labs/stylesheets': 'UniversalLabsStylesheets',
//     'tailwind-merge': 'tailwindMerge',
//   },
//   libName: 'UniversalLabsStyled',
// });
