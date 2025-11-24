import { tw } from '@native-twin/core';
import { sheetEntriesToCss } from '@native-twin/css';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import type * as vscode from 'vscode-languageserver';
import { TwinParserContext } from '../core/TwinParser.service.js';
import { createStyledContext } from '../internal/TwinParser.internals.js';
import * as Completions from '../utils/language/completions.maps.js';
import { getSheetEntryStyles } from '../utils/sheet.utils.js';

export const getCompletionEntryDetails = Effect.fn(function* (
  entry: vscode.CompletionItem,
  _cancelToken: vscode.CancellationToken,
) {
  const twinService = yield* TwinParserContext;
  const rules = yield* twinService.findRulesByKey(entry.label);
  const completionEntries = HashSet.map(HashSet.fromIterable(rules), (x) => {
    const sheet = tw(x.className);
    const finalSheet = getSheetEntryStyles(sheet, createStyledContext(16));
    const css = sheetEntriesToCss(sheet);

    return Completions.createCompletionEntryDetails(entry, css, finalSheet);
  });

  return completionEntries.pipe(
    RA.fromIterable,
    RA.head,
    Option.getOrElse(() => entry),
  );
});
