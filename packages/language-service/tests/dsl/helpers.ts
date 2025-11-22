import { Effect } from 'effect';
import { TwinParser } from '../../src';

export const runTwinParser = (className: string, startPosition: number) =>
  Effect.gen(function* () {
    const parser = yield* TwinParser.TwinParserContext;

    // SubscriptionRef.set(runtime.twinConfigPathRef,)

    return yield* Effect.sync(() => parser.runTwinParser(className, startPosition));
  });
