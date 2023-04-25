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
    keepNames: true,
  },
  build: {
    outDir: 'build',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UniversalLabsStylesheets',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [
        'css-to-react-native',
        'react-native',
        'react-native-web',
        'react',
        'immer',
        'css-tree',
        '@universal-labs/core',
        '@adobe/css-tools',
        '@universal-labs/twind-native',
        'use-sync-external-store/shim',
        'react-native-uuid',
        'use-sync-external-store',
        'use-sync-external-store/shim/with-selector',
        '@universal-labs/core/tailwind/preset',
      ],
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      treeshake: true,
      output: {
        extend: true,
        externalImportAssertions: true,
        globals: {
          immer: 'Immer',
          'css-to-react-native': 'cssToReactNative',
          'react-native': 'ReactNative',
          'react-native-web': 'ReactNativeWeb',
          react: 'React',
          '@universal-labs/core': 'UniversalLabsCore',
          '@universal-labs/twind-native': 'UniversalLabsTwindNative',
          'use-sync-external-store/shim': 'useSyncExternalStoreShim',
          'use-sync-external-store': 'useSyncExternalStore',
          'use-sync-external-store/shim/with-selector': 'useSyncExternalStoreShimWithSelector',
          '@universal-labs/core/tailwind/preset': 'UniversalLabsCoreTailwindPreset',
        },
      },
    },
    emptyOutDir: false,
  },
});
