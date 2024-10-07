import * as Array from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import { CommandExecutor, Command } from '@effect/platform';
import { PlatformError } from '@effect/platform/Error';

const defaultArgs = Array.make('npx', 'tsc', '-p', 'tsconfig.build.json');
const watchArgs = Array.append(defaultArgs, '-w');
const command = pipe(
  Command.make(...defaultArgs),
  Command.workingDirectory(process.cwd()),
);
const watchCommand = pipe(
  Command.make(...watchArgs),
  Command.runInShell(true),
  Command.workingDirectory(process.cwd()),
);

export class TypescriptService extends Context.Tag('typescript/service')<
  TypescriptService,
  {
    generate: () => Effect.Effect<string, PlatformError, CommandExecutor.CommandExecutor>;
    watch: () => Command.Command;
  }
>() {
  static Live = Layer.scoped(
    TypescriptService,
    Effect.gen(function* () {
      return {
        generate: () =>
          Effect.gen(function* () {
            const result = yield* Command.string(command);
            return result;
          }),
        watch: () => watchCommand,
      };
    }),
  );
}
