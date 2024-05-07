import * as ReadonlyArray from 'effect/Array';
import * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver-types';
import { FinalSheet } from '@native-twin/css';
import { TwinDocument } from '../../documents/document.resource';
import { TemplateTokenWithText } from '../../template/template.models';
import { TwinRuleWithCompletion } from '../../types/native-twin.types';
import { VscodeCompletionItem } from '../language.models';
import {
  // getCompletionEntryDetailsDisplayParts,
  getCompletionTokenKind,
  getDocumentationMarkdown,
} from './language.utils';

export const completionRuleToEntry = (
  completionRule: TwinRuleWithCompletion,
  index: number,
) => {
  const { completion } = completionRule;
  return new VscodeCompletionItem({
    kind: getCompletionTokenKind(completionRule),
    filterText: completion.className,
    label: completion.className,
    sortText: index.toString().padStart(8, '0'),
    // detail: getCompletionEntryDetailsDisplayParts(completionRule)?.text,
    detail: undefined,
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
  completion.documentation = documentation;
  return completion;
  // return {
  //   ...completion,
  //   documentation: {
  //     kind: vscode.MarkupKind.Markdown,
  //     value: documentation,
  //   },
  // };
}

export const completionRulesToEntries = (
  flattenTemplateTokens: ReadonlyArray<TemplateTokenWithText>,
  ruleCompletions: ReadonlyArray<TwinRuleWithCompletion>,
  document: TwinDocument,
) => {
  return pipe(
    flattenTemplateTokens,
    ReadonlyArray.flatMap((x) => {
      const range = vscode.Range.create(
        document.handler.positionAt(x.bodyLoc.start),
        document.handler.positionAt(x.bodyLoc.end),
      );
      return pipe(
        ReadonlyArray.fromIterable(ruleCompletions),
        ReadonlyArray.filter((y) => y.completion.className.startsWith(x.text)),
        ReadonlyArray.map((z) => completionRuleToEntry(z, z.order)),
        ReadonlyArray.dedupe,
        ReadonlyArray.map((zz) => ({
          ...zz,
          textEdit: {
            insert: range,
            range: range,
            newText: zz.label,
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

  return Data.struct({
    range,
    contents: {
      language: vscode.MarkupKind.Markdown,
      value: documentation,
    },
  });
}
