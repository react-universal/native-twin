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
    dts({
      entryRoot: path.resolve(__dirname, 'src'),
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      minify: true,
      mainFields: ['module', 'main'],
    },
  },
  build: {
    reportCompressedSize: true,
    ssr: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UniversalLabsStylesheets',
      fileName: (format) => {
        if (format === 'cjs') {
          return 'index.js';
        }
        return `index.${format}.js`;
      },
      formats: ['cjs', 'es', 'umd', 'iife'],
    },
    outDir: 'build',
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
        dir: 'build',
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
