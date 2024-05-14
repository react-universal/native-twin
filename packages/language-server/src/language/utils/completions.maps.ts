import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver-types';
import { FinalSheet } from '@native-twin/css';
import { TwinDocument } from '../../documents/document.resource';
import { TwinRuleWithCompletion } from '../../types/native-twin.types';
import { TemplateTokenData, VscodeCompletionItem } from '../language.models';
import {
  getCompletionEntryDetailsDisplayParts,
  getCompletionTokenKind,
  getDocumentationMarkdown,
} from './language.utils';

export const completionRuleToEntry = (
  completionRule: TwinRuleWithCompletion,
  _index: number,
) => {
  const { completion, order } = completionRule;
  return new VscodeCompletionItem({
    kind: getCompletionTokenKind(completionRule),
    filterText: completion.className,
    label: completion.className,
    sortText: order.toString().padStart(8, '0'),
    detail: getCompletionEntryDetailsDisplayParts(completionRule)?.text,
    labelDetails: {
      description: completion.declarations.join(','),
    },
    insertText: completion.className,
    insertTextFormat: 2,
    textEditText: completionRule.completion.className,
  });
};

export function createCompletionEntryDetails(
  completion: vscode.CompletionItem,
  sheetEntry: FinalSheet,
): vscode.CompletionItem {
  const documentation = getDocumentationMarkdown(sheetEntry);
  return {
    ...completion,
    documentation: {
      kind: vscode.MarkupKind.Markdown,
      value: documentation,
    },
  };
}

export const completionRulesToEntries = (
  flattenTemplateTokens: ReadonlyArray<TemplateTokenData>,
  ruleCompletions: ReadonlyArray<TwinRuleWithCompletion>,
  document: TwinDocument,
) => {
  return pipe(
    flattenTemplateTokens,
    ReadonlyArray.flatMap((x) => {
      const range = vscode.Range.create(
        document.handler.positionAt(x.token.bodyLoc.start),
        document.handler.positionAt(x.token.bodyLoc.end),
      );
      return pipe(
        ReadonlyArray.fromIterable(ruleCompletions),
        ReadonlyArray.filter((y) => y.completion.className.startsWith(x.token.text)),
        ReadonlyArray.map((completion) => {
          const result = completionRuleToEntry(completion, completion.order);
          if (x.base && x.base.token.type === 'CLASS_NAME') {
            result.insertText = result.insertText.replace(`${x.base.token.value.n}-`, '');
          }
          return result;
        }),
        ReadonlyArray.dedupe,
        ReadonlyArray.map((item) => ({
          ...item,
          textEdit: {
            insert: range,
            range: range,
            newText: item.insertText,
            replace: range,
          },
        })),
      );
    }),
  );
};

export function completionRulesToQuickInfo(
  completionRules: HashSet.HashSet<TwinRuleWithCompletion>,
  sheetEntry: FinalSheet,
  range: vscode.Range,
): Option.Option<vscode.Hover> {
  return HashSet.map(completionRules, (_rule) => {
    return completionRuleToQuickInfo(sheetEntry, range);
  }).pipe(HashSet.values, (x) => ReadonlyArray.fromIterable(x), ReadonlyArray.head);
}

export function completionRuleToQuickInfo(
  sheetEntry: FinalSheet,
  range: vscode.Range,
): vscode.Hover {
  const documentation = getDocumentationMarkdown(sheetEntry);

  return {
    range,
    contents: {
      kind: vscode.MarkupKind.Markdown,
      value: documentation,
    },
  };
}
