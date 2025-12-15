import { sheetEntriesToCss } from '@native-twin/css';
import * as Effect from 'effect/Effect';
import type * as vscode from 'vscode-languageserver';
import { TwinParserContext } from '../core/TwinParser.service';
import { LSPAdapterSpec } from '../internal/LSPAdapterSpec';
import { LSPPosition } from '../models/LSP.models';
import { getCSSMarkDownParts, sheetEntriesToMD } from '../utils/language/language.utils';
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

  const region = document.findRegionAt(LSPPosition.fromObject(params.position));
  if (!region) return undefined;

  const sheetEntries = yield* parser.runTW(region.text);
  const entries = sheetEntries;

  return completionRulesToQuickInfo(
    sheetEntriesToMD(entries, yield* parser.data.styledContext),
    getCSSMarkDownParts(sheetEntriesToCss(entries)).join('\n'),
    region.range,
  );
});
