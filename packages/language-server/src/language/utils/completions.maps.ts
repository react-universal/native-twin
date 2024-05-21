import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
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
        ReadonlyArray.filter((y) => {
          if (y.completion.className.startsWith(x.token.text)) return true;
          if (y.completion.className.startsWith(x.token.completionText)) return true;
          if (x.base) {
            if (x.base.token.type === 'CLASS_NAME') {
              if (x.token.token.type === 'VARIANT_CLASS') {
                const className = `${x.base.token.value.n}-${x.token.token.value[1].value.n}`;
                if (y.completion.className.startsWith(className)) {
                  return true;
                }
              }
            }
          }

          return false;
        }),
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
