/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  test: {
    env: {
      APP_ENV: 'test',
    },
  },
  plugins: [
    // Plugin for .d.ts files
    dts({
      entryRoot: path.resolve(__dirname, 'src'),
      outputDir: 'build',
      insertTypesEntry: true,
    }),
  ],
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
        '@universal-labs/core',
        'use-sync-external-store/shim',
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
          'css-to-react-native': 'cssToReactNative',
          'react-native': 'ReactNative',
          'react-native-web': 'ReactNativeWeb',
          react: 'React',
          '@universal-labs/core': 'UniversalLabsCore',
          'use-sync-external-store/shim': 'useSyncExternalStoreShim',
          'use-sync-external-store': 'useSyncExternalStore',
          'use-sync-external-store/shim/with-selector': 'useSyncExternalStoreShimWithSelector',
          '@universal-labs/core/tailwind/preset': 'UniversalLabsCoreTailwindPreset',
        },
      },
    },
  },
});
