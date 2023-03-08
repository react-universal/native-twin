/// <reference types="vitest" />
// Configure Vitest (https://vitest.dev/config/)
import { readdir, readFile } from 'fs/promises';
import path, { parse } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, DepOptimizationConfig } from 'vite';

const esbuildPlugins: DepOptimizationConfig['esbuildOptions'] = {
  plugins: [
    {
      name: 'alias',
      async setup({ onLoad, onResolve, resolve, esbuild }) {
        const stubFiles = await readdir('src/stubs', { withFileTypes: true });
        const stubNames = stubFiles
          .filter((file) => file.isFile())
          .map((file) => parse(file.name).name);

        onResolve({ filter: new RegExp(`^(${stubNames.join('|')})$`) }, ({ path }) => ({
          path: fileURLToPath(new URL(`stubs/${path}.ts`, import.meta.url)),
          sideEffects: false,
        }));

        onResolve({ filter: /^tailwindcss$/ }, ({ path, ...options }) => {
          path;
          return resolve('tailwindcss/src', options);
        });

        onResolve({ filter: /^tailwindcss\/lib/ }, ({ path, ...options }) =>
          resolve(path.replace('lib', 'src'), options),
        );

        onResolve(
          { filter: /^\.+\/(util\/)?log$/, namespace: 'file' },
          ({ path, ...options }) => {
            if (options.importer.includes('tailwindcss')) {
              return {
                path: fileURLToPath(
                  new URL('stubs/tailwindcss/utils/log.ts', import.meta.url),
                ),
                sideEffects: false,
              };
            }
            return resolve(path, {
              ...options,
              namespace: 'noRecurse',
            });
          },
        );

        onResolve({ filter: /^postcss-selector-parser\/.*\/\w+$/ }, ({ path, ...options }) =>
          resolve(`${path}.js`, options),
        );

        onLoad({ filter: /tailwindcss\/src\/css\/preflight\.css$/ }, async ({ path }) => {
          const result = await esbuild.build({
            entryPoints: [path],
            minify: true,
            logLevel: 'silent',
            write: false,
          });
          return { contents: result.outputFiles[0].text, loader: 'text' };
        });

        onLoad(
          { filter: /\/tailwindcss\/stubs\/defaultConfig\.stub\.js$/ },
          async ({ path }) => {
            const cjs = await readFile(path, 'utf8');
            const esm = cjs.replace('module.exports =', 'export default');
            return { contents: esm };
          },
        );
      },
    },
  ],
};

export default defineConfig({
  test: {},
  plugins: [],
  optimizeDeps: {
    esbuildOptions: {
      plugins: esbuildPlugins.plugins,
      minify: true,
      mainFields: ['module', 'main'],
      allowOverwrite: true,
      supported: {
        'nullish-coalescing': false,
        'optional-chain': false,
      },
      logLevel: 'info',
      define: {
        'process.env.DEBUG': 'undefined',
        'process.env.JEST_WORKER_ID': '1',
        __dirname: '"/"',
      },
    },
  },
  logLevel: 'info',
  build: {
    reportCompressedSize: true,
    ssr: false,
    lib: {
      entry: path.resolve(__dirname, 'src/builds/module.ts'),
      name: '@universal-labs/native-tailwind',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'es', 'umd', 'iife'],
    },
    rollupOptions: {
      external: [
        'postcss',
        'postcss-css-variables',
        'css-to-react-native',
        'postcss-js',
        'postcss-color-rgb',
        '@tailwindcss/oxide',
        'svgo',
      ],
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      treeshake: true,
      output: {
        dir: 'build',
        extend: true,
        externalImportAssertions: true,
      },
    },
  },
});
