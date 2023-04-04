/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { PluginOption, defineConfig, UserConfig } from 'vite';
import dts from 'vite-plugin-dts';

function getConfigForNative(input: {
  dirname: string;
  usesReactPlugin: boolean;
  externals: string[];
  globals: Record<string, string>;
  libName: string;
}) {
  return defineConfig({
    test: getTestConfig(),
    plugins: getPluginsConfig(input.dirname, input.usesReactPlugin),
    optimizeDeps: getOptimizeDepsConfig(),
    build: getBuildConfig(input.dirname, input.externals, input.globals, input.libName),
  });
}

function getPluginsConfig(dirname: string, isReact: boolean) {
  const plugins: PluginOption[] = [];
  if (isReact) {
    plugins.push(react());
  }
  plugins.push(
    dts({
      entryRoot: path.resolve(dirname, 'src'),
    }),
  );
  return plugins;
}

function getOptimizeDepsConfig() {
  return {
    esbuildOptions: {
      mainFields: ['module', 'main'],
    },
  };
}

function getTestConfig() {
  return {
    env: {
      APP_ENV: 'test',
    },
  };
}

function getBuildConfig(
  dirname: string,
  externals: string[],
  globals: Record<string, string>,
  libName: string,
): UserConfig['build'] {
  return {
    reportCompressedSize: true,
    ssr: false,
    lib: {
      entry: path.resolve(dirname, 'src/index.ts'),
      name: libName,
      fileName: (format) => {
        if (format === 'cjs') {
          return 'index.js';
        }
        return `index.${format}.js`;
      },
      formats: ['cjs', 'es', 'umd', 'iife'],
    },
    outDir: 'build',
    emptyOutDir: false,
    rollupOptions: {
      external: externals,
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      treeshake: true,
      output: {
        dir: 'build',
        extend: true,
        externalImportAssertions: true,
        globals,
      },
    },
  };
}

export { getConfigForNative };
