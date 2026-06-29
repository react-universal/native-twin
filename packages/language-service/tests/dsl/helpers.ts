import { Effect } from 'effect';
import { TwinParserContext, TwinParserContextLive } from '../../src';

export const runTwinParser = (className: string, startPosition: number) =>
  Effect.gen(function* () {
    const parser = yield* TwinParserContext;

    // SubscriptionRef.set(runtime.twinConfigPathRef,)

    return yield* Effect.sync(() =>
      parser.runTwinParser({ text: className, startOffset: startPosition }),
    );
  }).pipe(Effect.provide(TwinParserContextLive));
