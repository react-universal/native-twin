import * as ReadonlyArray from 'effect/Array';
import * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver-types';
import { CompletionItem, Range } from 'vscode-languageserver/node';
import { FinalSheet } from '@native-twin/css';
import { TemplateNode } from '../../documents/document.resource';
import { TwinStore } from '../../native-twin/native-twin.models';
import { TemplateTokenWithText } from '../../template/template.models';
import { TwinRuleWithCompletion } from '../../types/native-twin.types';
import { VscodeCompletionItem } from '../language.models';
import { orderCompletions } from './completion.ord';
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
  completionRules: ReadonlyArray<TwinRuleWithCompletion>,
) => {
  let i = 0;
  return pipe(
    completionRules,
    ReadonlyArray.sort(orderCompletions),
    ReadonlyArray.map((rule) => completionRuleToEntry(rule, i++)),
    ReadonlyArray.dedupe,
  );
  // return HashSet.map(completionRules, (rule) => {
  //   // const documentPosition = node.node.pos + 1;
  //   // const documentStart = rule.token.start + documentPosition;
  //   // const documentEnd = rule.token.end + documentPosition;
  //   // const replacementSpan: vscode.CompletionItem[''] = {
  //   //   start: node.document.document.offsetAt(
  //   //     node.templateContext.toPosition(documentStart),
  //   //   ),
  //   //   length:
  //   //     node.templateContext.toOffset(node.templateContext.toPosition(documentEnd)) -
  //   //     node.templateContext.toOffset(node.templateContext.toPosition(documentStart)),
  //   // };
  //   return completionRuleToEntry(rule, i++);
  // }).pipe(ReadonlyArray.fromIterable, ReadonlyArray.dedupe);
};

export function completionRulesToQuickInfo(
  completionRules: HashSet.HashSet<TwinRuleWithCompletion>,
  sheetEntry: FinalSheet,
  range: Range,
): Option.Option<vscode.Hover> {
  return HashSet.map(completionRules, (_rule) => {
    // const documentPosition = node.node.pos + 1;
    // const documentStart = rule.token.start + documentPosition;
    // const documentEnd = rule.token.end + documentPosition;
    // const replacementSpan: ts.TextSpan = {
    //   start: node.templateContext.toOffset(
    //     node.templateContext.toPosition(documentStart),
    //   ),
    //   length:
    //     node.templateContext.toOffset(node.templateContext.toPosition(documentEnd)) -
    //     node.templateContext.toOffset(node.templateContext.toPosition(documentStart)),
    // };
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
