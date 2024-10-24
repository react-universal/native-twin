import CodeBlockWriter from 'code-block-writer';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import path from 'path';
import { transformJSXFile } from '@native-twin/babel/jsx-babel';
// import * as Option from 'effect/Option';
import {
  BabelLogger,
  BabelTransformerService,
  BabelTransformerServiceLive,
} from '@native-twin/babel/services';
import { bufferToString } from '@native-twin/helpers/server';
import { makeWorkerLayers, MetroWorkerService } from '../services/MetroWorker.service';
import type { TransformWorkerFn } from '../services/models/metro.models';

// import { transformCSS } from './css/css.transform';

const metroMainProgram = Effect.gen(function* () {
  const { runWorker, input, config, getPlatformOutput } = yield* MetroWorkerService;
  const { isNotAllowedPath } = yield* BabelTransformerService;
  // if (config.isCSS) {
  //   const result = yield* transformCSS;
  //   if (Option.isSome(result)) {
  //     return result.value;
  //   }
  // }

  if (config.isCSS) {
    const result = yield* runWorker(input);
    return result;
  }

  if (input.filename.match(/\.css\..+?\.js$/)) {
    console.log('[METRO_TRANSFORMER]: Inside generated style file');
    const writer = new CodeBlockWriter();

    // writer.write(`import { StyleSheet } from '@native-twin/jsx';`);
    // writer.writeLine(`import { setup } from '@native-twin/core';`);
    // writer.newLine();
    const twinConfigPath = input.config.tailwindConfigPath;
    const importTwinPath = path.relative(
      path.dirname(input.config.outputCSS),
      twinConfigPath,
    );
    // if (!importTwinPath.startsWith('.')) {
    //   importTwinPath = `./${importTwinPath}`;
    // }
    writer.write(`const StyleSheet = require('@native-twin/jsx').StyleSheet;`);
    writer.writeLine(`const setup = require('@native-twin/core').setup;`);
    writer.writeLine(`const twinConfig = require('${importTwinPath}');`);
    writer.newLine();

    writer.writeLine(`setup(twinConfig);`);
    writer.writeLine(
      `console.log(\`Style Fast Refresh: \${Date.now()-${Date.now()}}ms\`)`,
    );

    writer.writeLine('// Replace_Me');
    const result = yield* runWorker({
      ...input,
      data: Buffer.from(writer.toString()),
    });

    return {
      dependencies: result.dependencies,
      output: [
        {
          // data: result.output[0].data,
          data: {
            ...(result.output as any)[0].data,
            code: (result.output as any)[0].data.code.replace(
              '// Replace_Me',
              input.data.toString('utf-8'),
            ),
          },
          type: (result.output as any)[0].type,
        },
      ],
    };
  }

  if (isNotAllowedPath(input.filename)) {
    return yield* runWorker(input);
  }

  const compiled = yield* transformJSXFile(bufferToString(input.data));

  const writer = new CodeBlockWriter();

  const outputImportPath = getPlatformOutput(input.options.platform ?? 'native')
    .replace(/.*(node_modules)\//g, '')
    .replace('.js', '');
  writer.writeLine(`import { globalStyles } from '${outputImportPath}';`);
  writer.writeLine(compiled.generated);

  const result = yield* runWorker({
    ...input,
    data: Buffer.from(writer.toString()),
  });
  // console.log('RESULT: ', (result.output[0] as any)?.code);
  // console.log('INPUT: ', input);
  return result;
});

const MainLayer = BabelTransformerServiceLive.pipe(
  Layer.merge(BabelTransformerServiceLive),
  Layer.merge(Logger.replace(Logger.defaultLogger, BabelLogger)),
);

export const metroRunnable = Effect.scoped(
  metroMainProgram.pipe(
    Logger.withMinimumLogLevel(LogLevel.All),
    Effect.provide(MainLayer),
  ),
);

export const transform: TransformWorkerFn = async (
  config,
  projectRoot,
  filename,
  data,
  options,
) => {
  const runtime = pipe(
    makeWorkerLayers(config, projectRoot, filename, data, options),
    ManagedRuntime.make,
  );
  return runtime.runPromise(metroRunnable);
};
