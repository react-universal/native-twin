import { sheetEntriesToCss } from '@native-twin/css';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import type * as vscode from 'vscode-languageserver';
import { TwinParserContext } from '../core/TwinParser.service';
import * as Completions from '../utils/language/completions.maps';
import { getSheetEntryStyles } from '../utils/sheet.utils';

export const getCompletionEntryDetails = Effect.fn(function* (
  entry: vscode.CompletionItem,
  _cancelToken: vscode.CancellationToken,
) {
  const twinService = yield* TwinParserContext;
  const styledContext = yield* twinService.data.styledContext;
  const rule = yield* twinService.getRuleByClassName(entry.label);

  const sheet =  yield* twinService.runTW(Option.map(rule, (x) => x.className).pipe(Option.getOrElse(() => '')));
  const finalSheet = getSheetEntryStyles(sheet, styledContext);
  const css = sheetEntriesToCss(sheet);

  return Completions.createCompletionEntryDetails(entry, css, finalSheet);
});
