import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';

export interface ConfigRef<A> {
  readonly get: Effect.Effect<A>;
  readonly changes: Stream.Stream<A>;
}
