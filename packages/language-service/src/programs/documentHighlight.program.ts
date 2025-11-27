import { asArray } from '@native-twin/helpers';
import * as Effect from 'effect/Effect';
import * as vscode from 'vscode-languageserver';
import { TwinParserContext } from '../core/TwinParser.service';
import { LSPAdapterSpec } from '../internal/LSPAdapterSpec';

export const getDocumentHighLightsProgram = Effect.fn(function* (
  params: vscode.DocumentHighlightParams,
  _token: vscode.CancellationToken,
  _workDone: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.DocumentHighlight[]> | undefined,
) {
  const { getLSPDocument } = yield* LSPAdapterSpec;
  const parser = yield* TwinParserContext;
  const document = yield* getLSPDocument(params.textDocument.uri);
  const region = document.findRegionAt(params.position);

  if (!region) return [];
  const parsed = yield* parser.runFullParserEffect(
    region.text,
    document.offsetAt(region.range.start),
  );

  return parsed.flatMap(({ parsedRegion }) => {
    if (parsedRegion.raw.type !== 'CLASS_NAME') return [];
    return asArray(
      vscode.DocumentHighlight.create(
        document.getRangeFor(parsedRegion.startOffset, parsedRegion.endOffset),
        vscode.DocumentHighlightKind.Write,
      ),
    );
  });
});
