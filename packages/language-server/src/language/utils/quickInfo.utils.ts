import * as ReadonlyArray from 'effect/Array';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver-types';
import { FinalSheet } from '@native-twin/css';
import { TwinRuleWithCompletion } from '../../types/native-twin.types';
import { getDocumentationMarkdown } from './language.utils';

export const completionRulesToQuickInfo = (
  completionRules: HashSet.HashSet<TwinRuleWithCompletion>,
  sheetEntry: FinalSheet,
  range: vscode.Range,
): Option.Option<vscode.Hover> =>
  HashSet.map(completionRules, (_rule) => {
    return completionRuleToQuickInfo(sheetEntry, range);
  }).pipe(HashSet.values, (x) => ReadonlyArray.fromIterable(x), ReadonlyArray.head);

export const completionRuleToQuickInfo = (
  sheetEntry: FinalSheet,
  range: vscode.Range,
): vscode.Hover => ({
  range,
  contents: {
    kind: vscode.MarkupKind.Markdown,
    value: getDocumentationMarkdown(sheetEntry),
  },
});
