import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
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

export const annotatedLayer =
  (name: string) =>
  <In, Out, R>(layer: Layer.Layer<In, Out, R>) => {
    return layer.pipe(
      Layer.withSpan(`[layer] ${name}`),
      Layer.annotateLogs(`layer`, name),
      Layer.tap(() => Effect.logDebug(`[layer] ${name} - created`).pipe(Effect.withLogSpan(name))),
    );
  };

const listenStreamChanges = <A, E, R>(
  stream: Stream.Stream<A, E>,
  f: (data: A) => Effect.Effect<void, never, R>,
): Effect.Effect<void, never, R> => {
  return Effect.flatMap(Effect.runtime<R>(), (runtime) => {
    const run = Runtime.runFork(runtime);
    return stream.pipe(
      Stream.mapEffect(f),
      Stream.runDrain,
      Effect.catchAllCause((_) => Effect.logError('unhandled defect in event listener', _)),
      run,
    );
  });
};

export const listenForkedStreamChanges = <A, E, R>(
  stream: Stream.Stream<A, E>,
  f: (data: A) => Effect.Effect<void, never, R>,
) => Effect.forkScoped(listenStreamChanges(stream, f));
