import { defineConfig, Options } from 'tsup';
import { tsupExternals } from '../config/constants';
import { CliConfigFile } from '../esbuild-cli/cli.types';

// import { requireResolvePlugin } from '../esbuild-cli/requireResolve.plugin';

export const getTsUpConfig = (configFile: CliConfigFile, watch: boolean): Options =>
  defineConfig({
    // esbuildPlugins: [requireResolvePlugin()],
    entry: configFile.entries,
    format: ['cjs', 'esm'],
    experimentalDts: true,
    external: [...tsupExternals, ...configFile.external],
    legacyOutput: true,
    clean: false,
    metafile: true,
    name: 'Native Twin',
    globalName: 'native_twin',
    platform: configFile.platform,
    esbuildOptions: (opt) => {
      opt.logLevel = 'info';
    },
    cjsInterop: false,
    minify: !watch,
    loader: {
      '.snap': 'copy',
      '.ios': 'copy',
      '.android': 'copy',
    },
    shims: configFile.platform === 'browser',
    bundle: false,
    treeshake: 'safest',
    tsconfig: 'tsconfig.build.json',
    splitting: false,
    outDir: './build',
    sourcemap: true,
    watch,
  }) as Options;
