import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver-types';
import { FinalSheet } from '@native-twin/css';
import { TwinStore } from '../../native-twin/native-twin.models';
import {
  TwinRuleWithCompletion,
  TwinVariantCompletion,
} from '../../types/native-twin.types';
import { TemplateTokenData, VscodeCompletionItem } from '../language.models';
import { getDocumentationMarkdown } from './language.utils';

export const variantCompletionToEntry = (
  variant: TwinVariantCompletion,
  range: vscode.Range,
  insertText: string,
) => new VscodeCompletionItem(variant, range, insertText);

export const createCompletionEntryDetails = (
  completion: vscode.CompletionItem,
  sheetEntry: FinalSheet,
): vscode.CompletionItem => ({
  ...completion,
  documentation: {
    kind: vscode.MarkupKind.Markdown,
    value: getDocumentationMarkdown(sheetEntry),
  },
});

export const getAllCompletionRules = (
  ruleCompletions: TwinStore,
  range: vscode.Range,
) => {
  const rules = pipe(
    ruleCompletions.twinRules,
    ReadonlyArray.fromIterable,
    ReadonlyArray.filter((x) => !x.completion.className.startsWith('-')),
    ReadonlyArray.map((y) =>
      completionRuleToEntry(y, y.order, range, y.completion.className),
    ),
  );
  return pipe(
    ruleCompletions.twinVariants,
    ReadonlyArray.fromIterable,
    ReadonlyArray.map((x) => variantCompletionToEntry(x, range, x.name)),
    ReadonlyArray.appendAll(rules),
  );
};

export const completionRulesToEntries = (
  flattenTemplateTokens: ReadonlyArray<TemplateTokenData>,
  ruleCompletions: ReadonlyArray<TwinRuleWithCompletion>,
  document: TextDocument,
) =>
  pipe(
    flattenTemplateTokens,
    ReadonlyArray.flatMap((x) => {
      const range = vscode.Range.create(
        document.positionAt(x.token.bodyLoc.start),
        document.positionAt(x.token.bodyLoc.end),
      );
      return pipe(
        ReadonlyArray.fromIterable(ruleCompletions),
        ReadonlyArray.filter(
          (y) =>
            y.completion.className.startsWith(x.token.text) ||
            y.completion.className.startsWith(x.token.completionText),
        ),
        ReadonlyArray.map((completion) => {
          let insertText = completion.completion.className;
          if (x.base && x.base.token.type === 'CLASS_NAME') {
            insertText = insertText.replace(`${x.base.token.value.n}-`, '');
          }
          return completionRuleToEntry(completion, completion.order, range, insertText);
        }),
      );
    }),
  );

export const completionRuleToEntry = (
  completionRule: TwinRuleWithCompletion,
  _index: number,
  range: vscode.Range,
  insertText: string,
) => new VscodeCompletionItem(completionRule, range, insertText);

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
