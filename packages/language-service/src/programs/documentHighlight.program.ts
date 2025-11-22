import * as Effect from 'effect/Effect';
import type * as vscode from 'vscode-languageserver';

export const getDocumentHighLightsProgram = Effect.fn(function* (
  _params: vscode.DocumentHighlightParams,
  _token: vscode.CancellationToken,
  _workDone: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.DocumentHighlight[]> | undefined,
) {
  // const documentsHandler = yield* TwinLSPDocumentContext;
  // const document = yield* documentsHandler
  //   .getDocument(params.textDocument.uri)
  //   .pipe(Effect.map(Option.getOrNull));

  // if (!document) return [];

  // const cursorOffset = document.offsetAt(params.position);
  // const region = yield* documentsHandler.findTokenAtPosition(document, params.position);
  // const highlights: vscode.DocumentHighlight[] = region.pipe(
  //   Option.flatMap((x) => x.getParsedNodeAtOffset(cursorOffset)),
  //   Option.map((node) => {
  //     const highLights: vscode.DocumentHighlight[] = [];
  //     if (node.token.type === 'CLASS_NAME') {
  //       highLights.push({
  //         range: vscode.Range.create(
  //           document.positionAt(node.bodyLoc.start),
  //           document.positionAt(node.bodyLoc.end),
  //         ),
  //         kind: vscode.DocumentHighlightKind.Text,
  //       });
  //     }
  //     return highLights;
  //   }),
  //   Option.getOrElse(() => []),
  // );

  return yield* Effect.succeed([]);
});
