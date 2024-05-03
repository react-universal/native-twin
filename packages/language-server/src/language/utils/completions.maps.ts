import * as ReadonlyArray from 'effect/Array';
import * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver-types';
import { CompletionItem, Range } from 'vscode-languageserver/node';
import { FinalSheet } from '@native-twin/css';
import { TemplateNode, TwinDocument } from '../../documents/document.resource';
import { TwinStore } from '../../native-twin/native-twin.models';
import { TemplateTokenWithText } from '../../template/template.models';
import { TwinRuleWithCompletion } from '../../types/native-twin.types';
import { VscodeCompletionItem } from '../language.models';
import {
  getCompletionEntryDetailsDisplayParts,
  getCompletionTokenKind,
  getDocumentationMarkdown,
  getFlattenTemplateToken,
} from './language.utils';

export const createCompletionsWithToken = (template: TemplateNode, store: TwinStore) => {
  const positionTokens: TemplateTokenWithText[] = pipe(
    template.parsedNode,
    ReadonlyArray.fromIterable,
    ReadonlyArray.map((x) => getFlattenTemplateToken(x)),
    ReadonlyArray.flatten,
    ReadonlyArray.dedupe,
  );

  return pipe(
    store.twinRules,
    HashSet.flatMap((ruleInfo) => {
      return HashSet.fromIterable(positionTokens).pipe(
        HashSet.filter((x) => {
          if (ruleInfo.completion.className === x.text) {
            return true;
          }
          if (x.token.type === 'VARIANT_CLASS') {
            return ruleInfo.completion.className.startsWith(x.token.value[1].value.n);
          }

          return ruleInfo.completion.className.startsWith(x.text);
        }),
        HashSet.map(
          (): TwinRuleWithCompletion => ({
            completion: ruleInfo.completion,
            composition: ruleInfo.composition,
            rule: ruleInfo.rule,
            order: ruleInfo.order,
          }),
        ),
      );
    }),
  );
};

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
  completion: CompletionItem,
  sheetEntry: FinalSheet,
): CompletionItem {
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
  flattenCompletions: ReadonlyArray<TemplateTokenWithText>,
  ruleCompletions: HashSet.HashSet<TwinRuleWithCompletion>,
  document: TwinDocument,
) => {
  return pipe(
    ReadonlyArray.fromIterable(flattenCompletions),
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
  range: Range,
): Option.Option<vscode.Hover> {
  return HashSet.map(completionRules, (_rule) => {
    return completionRuleToQuickInfo(sheetEntry, range);
  }).pipe(HashSet.values, (x) => ReadonlyArray.fromIterable(x), ReadonlyArray.head);
}

export function completionRuleToQuickInfo(
  sheetEntry: FinalSheet,
  range: Range,
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
