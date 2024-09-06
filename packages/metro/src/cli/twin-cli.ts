import { Command, Options } from '@effect/cli';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { Array, Console, Effect } from 'effect';

const configs = Options.keyValueMap('c');

const twinCli = Command.make('twin-cli', { configs }, ({ configs }) => {
  const keyValuePairs = Array.fromIterable(configs)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
  return Console.log(`Running twin-cli with the configs: ${keyValuePairs}`);
});

const cli = Command.run(twinCli, {
  name: 'twin-cli Distributed Version Control',
  version: 'v1.0.0',
});

cli(process.argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);
