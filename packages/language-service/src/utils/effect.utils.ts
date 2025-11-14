import * as Effect from 'effect/Effect';
import * as Runtime from 'effect/Runtime';
import * as Stream from 'effect/Stream';
import * as Tracer from 'effect/Tracer';

interface TracerAttributes {
  parentContext?: string | undefined;
  currentContext: string;
}
export const effectWithTracer = Effect.functionWithSpan({
  body: (_label: string, _attributes: TracerAttributes) => Effect.currentSpan,
  options: (label, attributes) => ({
    name: label,
    attributes: { ...attributes, label },
    context: Tracer.DisablePropagation.context(true),
  }),
});

const listenStreamChanges = <A, E, R>(
  stream: Stream.Stream<A, E>,
  f: (data: A) => Effect.Effect<void, never, R>,
): Effect.Effect<void, never, R> => {
  return Effect.flatMap(Effect.runtime<R>(), (runtime) => {
    const run = Runtime.runFork(runtime);
    return stream.pipe(
      Stream.mapEffect(f),
      Stream.runDrain,
      Effect.catchAllCause((_) => Effect.log('unhandled defect in event listener', _)),
      run,
    );
  });
};

export const listenForkedStreamChanges = <A, E, R>(
  stream: Stream.Stream<A, E>,
  f: (data: A) => Effect.Effect<void, never, R>,
) => Effect.forkScoped(listenStreamChanges(stream, f));
