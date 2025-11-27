import { sheetEntriesToCss } from '@native-twin/css';
import * as Effect from 'effect/Effect';
import type * as vscode from 'vscode-languageserver';
import { TwinParserContext } from '../core/TwinParser.service';
import { LSPAdapterSpec } from '../internal/LSPAdapterSpec';
import { completionRulesToQuickInfo } from '../utils/language/quickInfo.utils';

export const getHoverDetails = Effect.fn(function* (
  params: vscode.HoverParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) {
  const { getLSPDocument } = yield* LSPAdapterSpec;
  const parser = yield* TwinParserContext;
  const document = yield* getLSPDocument(params.textDocument.uri);

  const region = document.findRegionAt(params.position);
  if (!region) return undefined;

  const sheetEntries = yield* parser.runTW(region.text);
  return completionRulesToQuickInfo(sheetEntries, sheetEntriesToCss(sheetEntries), region.range);
});
