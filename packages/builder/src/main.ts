#!/usr/bin/env node
import * as Command from '@effect/cli/Command';
import * as NodeContext from '@effect/platform-node/NodeContext';
import * as NodeRuntime from '@effect/platform-node/NodeRuntime';
import * as Effect from 'effect/Effect';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import { TwinCli } from './command';

const run = TwinCli.pipe(
  // Command.provide(Layer.empty),
  Command.run({
    name: 'Twin Cli',
    version: '1.0.1',
  }),
);

run(process.argv).pipe(
  Effect.provide(NodeContext.layer),
  Logger.withMinimumLogLevel(LogLevel.Debug),
  Effect.scoped,
  NodeRuntime.runMain({
    teardown: (_exit, onExit) => {
      onExit(0);
      process.exit(0);
    },
  }),
);

// let callAmount = 0;
// process.on('SIGINT', function (event) {
//   if (callAmount < 1) {
//     console.log(
//       `\n✅ The server has been stopped`,
//       'Shutdown information',
//       'This shutdown was initiated by CTRL+C.',
//     );
//     setTimeout(() => process.exit(), 100);
//   }
//   callAmount++;
// });
