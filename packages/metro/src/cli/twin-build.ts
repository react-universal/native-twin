import * as Args from '@effect/cli/Args';
// import * as CliConfig from '@effect/cli/CliConfig';
import * as Command from '@effect/cli/Command';
import * as Options from '@effect/cli/Options';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
// import * as Path from '@effect/platform/Path';
import { Context, Effect, Layer } from 'effect';
import * as Config from 'effect/Config';

// const config = CliConfig.make({
//   showTypes: true,
//   showAllNames: true,
//   showBuiltIns: true,
// });

// const watchArgs = Args.boolean({
//   name: 'watch',
// }).pipe(Args.withDefault(false), Args.withDescription('Watch mode'));

const twinCli = Command.make('twin-build', {
  verbose: Options.boolean('verbose').pipe(
    Options.withAlias('v'),
    Options.withFallbackConfig(Config.boolean('VERBOSE')),
  ),
}).pipe(
  Command.withDescription('Twin metro CLI'),
  Command.provideEffectDiscard(() => Effect.flatMap(Messages, (_) => _.log('Shared'))),
);

const watch = Command.make(
  'config',
  {
    file: Args.file({
      exists: 'yes',
      name: 'config',
    }).pipe(Args.withFallbackConfig(Config.string('tailwind.config.ts'))),
  },
  ({ file }) => {
    return Effect.gen(function* () {
      console.log('ASDASDASD', file);
      const { log } = yield* Messages;
      const { verbose } = yield* twinCli;
      if (verbose) {
        yield* log('Watching files');
      } else {
        yield* log('Watching');
      }
    });
  },
).pipe(Command.withDescription('Watch the paths on contents field '));

// const AddService = Context.GenericTag<'AddService'>('AddService');

const run = twinCli.pipe(
  Command.withSubcommands([watch]),
  Command.run({
    name: 'twin-cli',
    version: '1.0.0',
  }),
);

interface Messages {
  readonly log: (message: string) => Effect.Effect<void>;
  readonly messages: Effect.Effect<ReadonlyArray<string>>;
}
const Messages = Context.GenericTag<Messages>('Messages');
const MessagesLive = Layer.sync(Messages, () => {
  const messages: Array<string> = [];
  return Messages.of({
    log: (message) => Effect.sync(() => messages.push(message)),
    messages: Effect.sync(() => messages),
  });
});

const EnvLive = Layer.mergeAll(MessagesLive, NodeContext.layer);

Effect.suspend(() => run(process.argv)).pipe(
  Effect.provide(EnvLive),
  Effect.tapErrorCause(Effect.logError),
  NodeRuntime.runMain,
);
