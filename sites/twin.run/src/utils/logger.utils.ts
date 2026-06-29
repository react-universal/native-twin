// import { ILogService } from '@codingame/monaco-vscode-api';
// import { StandaloneServices } from '@codingame/monaco-vscode-api/vscode/vs/editor/standalone/browser/standaloneServices';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';

// export const getMonacoLogger = () => StandaloneServices.get(ILogService);

export const traceLayerLogs =
  (name: string) =>
  <In, Out, R>(layer: Layer.Layer<In, Out, R>) => {
    return pipe(
      layer,
      Layer.withSpan(`[layeraaaa] ${name}`),
      Layer.annotateLogs(`layer`, name),
      Layer.tap(() => Effect.log(`[layer] ${name} - created`).pipe(Effect.withLogSpan(name))),
      // Layer.tap(() => Effect.sync(() => getLogger().info('asdasdasd'))),
    );
  };
