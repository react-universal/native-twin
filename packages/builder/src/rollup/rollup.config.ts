import tsPlugin from '@rollup/plugin-typescript';
import * as Array from 'effect/Array';
import { pipe } from 'effect/Function';
import glob from 'glob';
import fs from 'node:fs';
import path, { join } from 'node:path';
import * as rollup from 'rollup';
import preserveDirectives from 'rollup-plugin-preserve-directives';
import { CliConfigFile } from '../esbuild-cli/cli.types';

const testPatterns = ['**/*.spec.ts', '**/*.test.ts'];

export const createRollupConfig = (_configFile: CliConfigFile) => {
  const entrypoints = Object.fromEntries(
    glob.sync('./src/**/!(*.d).{ts,tsx}').map((file) => {
      return [
        // This expands the relative paths to absolute paths, so e.g.
        path.relative('src', file.slice(0, file.length - path.extname(file).length)),
        // src/nested/foo becomes /project/src/nested/foo.js
        path.join('./', file),
      ];
    }),
  );

  const configs: rollup.RollupOptions[] = pipe(
    Array.make(
      libBuildOptions({
        format: 'esm',
        extension: 'js',
        entrypoints,
        outDir: 'build/esm',
        sourcemap: true,
      }),
    ),
    Array.append(
      libBuildOptions({
        format: 'cjs',
        extension: 'js',
        entrypoints,
        outDir: 'build',
        sourcemap: true,
      }),
    ),
    Array.map((x) => ({
      ...x,
      external: (id, _, isResolved) => {
        if (!isResolved) {
          return true;
        }
        if (path.isAbsolute(id)) return true;
        if (id.startsWith('.')) {
          return true;
        }
        return false;
      },
    })),
  );
  return rollup.defineConfig(configs);
};

interface BuildOptions {
  entrypoints: Record<string, string>;
  format: 'esm' | 'cjs';
  extension: 'js' | 'cjs' | 'mjs';
  outDir: string;
  sourcemap: boolean;
}
function libBuildOptions({
  entrypoints,
  format,
  outDir,
  sourcemap,
}: BuildOptions): rollup.RollupOptions {
  return {
    input: entrypoints,
    treeshake: true,
    jsx: 'preserve',
    logLevel: 'debug',
    shimMissingExports: true,
    plugins: [
      preserveDirectives({ exclude: ['**/*.tsx'] }),
      tsPlugin({
        exclude: [...testPatterns],
        tsconfig: 'tsconfig.build.json',
        compilerOptions: {
          sourceMap: sourcemap,
          declarationDir: format === 'esm' ? 'build/esm' : 'build',
          declarationMap: true,
          removeComments: false,
          declaration: true,
          outDir: format === 'esm' ? 'build/esm' : 'build',
        },
      }),
    ],
    output: {
      format,
      dir: outDir,
      // Using preserveModules disables bundling and the creation of chunks,
      // leading to a result that is a mirror of the input module graph.
      preserveModules: true,
      esModule: 'if-default-prop',
      interop: 'compat',
      sourcemap,
      generatedCode: 'es5',
      // Hoisting transitive imports adds bare imports in modules,
      // which can make imports by JS runtimes slightly faster,
      // but makes the generated code harder to follow.
      hoistTransitiveImports: false,
      preserveModulesRoot: 'src',
    },
  };
}

export function clearDir(dir: string): void {
  const dirPath = join(process.cwd(), dir);
  if (dir && fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`cleared: ${dir}`);
  }
}
