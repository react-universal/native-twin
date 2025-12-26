import { sheetEntriesToCss } from '@native-twin/css';
import * as Effect from 'effect/Effect';
import * as vscode from 'vscode-languageserver';
import { TwinParserContext } from '../core/TwinParser.service';
import { LSPAdapterSpec } from '../internal/LSPAdapterSpec';
import { getCSSMarkDownParts, sheetEntriesToMD } from '../models/Editor.models';
import { Position } from '../models/LSP.models';


export const getHoverDetails = Effect.fn(function* (
  params: vscode.HoverParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) {
  const { getLSPDocument } = yield* LSPAdapterSpec;
  const parser = yield* TwinParserContext;
  const document = yield* getLSPDocument(params.textDocument.uri);

  const region = document.findRegionAt(Position.make(params.position));
  if (!region) return undefined;

  const sheetEntries = yield* parser.runTW(region.value.text);
  const entries = sheetEntries;

  return completionRulesToQuickInfo(
    sheetEntriesToMD(entries, yield* parser.data.styledContext),
    getCSSMarkDownParts(sheetEntriesToCss(entries)).join('\n'),
    document.getNodeRange(region.value),
  );
});


const completionRulesToQuickInfo = (
  js: string,
  css: string,
  range: vscode.Range,
): vscode.Hover => {
  return {
    range,
    contents: {
      kind: vscode.MarkupKind.Markdown,
      value: [js, css].join('\n'),
    },
  };
};
