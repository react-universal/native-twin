// import { Effect } from 'effect';
import type { GetTransformOptions } from 'metro-config';
import path from 'node:path';
// import { makeWatcher } from './cli';
// import { makeLive } from './cli/MetroCli.service';
// import { decorateMetroServer } from './config/server/server.decorator';
import type {
  MetroWithNativeTwindOptions,
  ComposableIntermediateConfigT,
  MetroContextConfig,
} from './metro.types';
import {
  createCacheDir,
  getUserNativeWindConfig,
  setupNativeTwin,
  TWIN_CACHE_DIR,
  TWIN_STYLES_FILE,
} from './utils';

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  {
    outputDir = ['node_modules', '.cache', 'native-twin'].join(path.sep),
    projectRoot = process.cwd(),
    configPath: twinConfigPath = 'tailwind.config.ts',
  }: MetroWithNativeTwindOptions = {},
): ComposableIntermediateConfigT {
  const isDev = Boolean(process.env['NODE_ENV']) === true;
  const isHot = Boolean(process.env['NODE_ENV']) === true;
  outputDir = path.join(projectRoot, outputDir);
  createCacheDir(outputDir);
  const twinCacheFile = path.join(projectRoot, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
  const twConfig = getUserNativeWindConfig(twinConfigPath, outputDir);

  const twin = setupNativeTwin(twConfig, {
    dev: isDev,
    hot: isHot,
    platform: 'ios',
  });

  const allowedPaths = twConfig.content.map((x) => path.join(projectRoot, x));
  // allowedPaths.push(
  //   path.join(projectRoot, './node_modules/.cache/native-twin/**/*.{js,jsx,tsx,ts}'),
  // );
  const metroContext: MetroContextConfig = {
    configPath: twinConfigPath,
    dev: isDev,
    hot: isHot,
    projectRoot,
    outputDir,
    twinCacheFile,
    twin,
    twConfig,
    platform: 'ios',
    allowedPaths,
  };

  const getTransformOptions = async (...args: Parameters<GetTransformOptions>) => {
    return metroConfig.transformer?.getTransformOptions(...args);
  };

  // compilerRunnable.pipe(
  //   Effect.provide(makeLive(metroContext)),
  //   NodeRuntime.runMain,
  // );
  // makeWatcher.pipe(Effect.provide(makeLive(metroContext)), Effect.runPromise);

  // const child = spawn(
  //   'node',
  //   [path.join(__dirname, 'cli/worker.js'), '--verbose', '--watch'],
  //   {
  //     stdio: 'pipe',
  //     detached: false,
  //   },
  // );
  // // childP.
  // // const child = fork(path.join(__dirname, 'cli/worker.js'), {
  // //   stdio: 'pipe',
  // //   execArgv: ['--verbose'],
  // // });
  // console.log('ARGS: ', child.spawnargs);
  // child.on('spawn', () => {
  //   console.log('CHILD_SPAWN: ');
  // });

  // child.on('message', (message) => {
  //   console.log('CHILD_MESSAGE: ', message);
  // });
  // child.stdout?.on('data', (chunk) => {
  //   console.log('DATA: ', chunk);
  // });
  // child.stdout?.on('error', (chunk) => {
  //   console.log('ERROR: ', chunk);
  // });

  // const server = decorateMetroServer(metroConfig, twConfig, metroContext);

  return {
    ...metroConfig,
    resetCache: true,
    // server: server.server,
    // resolver: server.resolver,
    transformerPath: require.resolve('./transformer/metro.transformer'),
    transformer: {
      ...metroConfig.transformer,
      tailwindConfigPath: twinConfigPath,
      outputDir: metroContext.outputDir,
      allowedFiles: twConfig.content,
      transformerPath: metroConfig.transformerPath,
      getTransformOptions,
    },
  };
}
