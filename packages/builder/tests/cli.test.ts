import * as Command from '@effect/cli/Command';
import * as NodeContext from '@effect/platform-node/NodeContext';
import { describe, it } from '@effect/vitest';
import * as ConfigProvider from 'effect/ConfigProvider';
import * as Effect from 'effect/Effect';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import path from 'path';
import { TwinCli } from '../src/command';

const run = TwinCli.pipe(
  Command.run({
    name: 'Twin Cli',
    version: '1.0.1',
  }),
);

describe('Twin builder cli test', () => {
  it('Run cli', () =>
    Effect.gen(function* () {
      
      yield* Effect.log('STARTING CLI');
      const asd = yield* run(['node', 'twin.js', 'pack-dev']);
      console.log('ASD', asd);
    }).pipe(
      Logger.withMinimumLogLevel(LogLevel.Debug),
      Effect.withConfigProvider(
        ConfigProvider.fromJson({
          PROJECT_DIR: path.join(__dirname, 'fixture'),
        }),
      ),
      Effect.provide(NodeContext.layer),
      Effect.runPromise,
    ));
});
