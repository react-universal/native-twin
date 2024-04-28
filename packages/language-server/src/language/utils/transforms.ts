import * as ReadonlyArray from 'effect/Array';
import * as Data from 'effect/Data';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver-types';
import { CompletionItem } from 'vscode-languageserver/node';
import { FinalSheet } from '@native-twin/css';
import { TemplateNode } from '../../documents/document.resource';
import { TwinStore } from '../../native-twin/native-twin.utils';
import { TwinRuleWithCompletion } from '../../types/native-twin.types';
import {
  CompletionPart,
  getCompletionEntryDetailsDisplayParts,
  getCompletionParts,
  getCompletionTokenKind,
  getDocumentation,
} from './language.utils';

export const createCompletionsWithToken = (template: TemplateNode, store: TwinStore) => {
  const positionTokens: CompletionPart[] = pipe(
    template.parsedNode,
    ReadonlyArray.fromIterable,
    ReadonlyArray.map((x) => getCompletionParts(x)),
    ReadonlyArray.flatten,
    ReadonlyArray.dedupe,
  );

  return pipe(
    store.twinRules,
    HashSet.flatMap((ruleInfo) => {
      return HashSet.fromIterable(positionTokens).pipe(
        HashSet.filter((x) => {
          if (ruleInfo.completion.className === x.parts.text) {
            return true;
          }
          if (x.parts.type === 'VARIANT_CLASS') {
            return ruleInfo.completion.className.startsWith(x.parts.value[1].value.n);
          }

          return ruleInfo.completion.className.startsWith(x.parts.text);
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

// export const filterCompletionByTemplateOffset = (
//   tokens: HashSet.HashSet<TwinRuleWithCompletion>,
//   position: number,
// ) => HashSet.filter(tokens, (x) => position >= x.token.start && position <= x.token.end);

export const completionRuleToEntry = (
  completionRule: TwinRuleWithCompletion,
  index: number,
): vscode.CompletionItem => {
  const { completion } = completionRule;
  return Data.struct({
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
  item: TwinRuleWithCompletion,
  sheetEntry: FinalSheet,
): CompletionItem {
  const documentation = getDocumentation(item, sheetEntry);

  return {
    ...completion,
    documentation: {
      kind: vscode.MarkupKind.Markdown,
      value: documentation,
    },
  };
}

export const completionRulesToEntries = (
  completionRules: HashSet.HashSet<TwinRuleWithCompletion>,
) => {
  let i = 0;
  return HashSet.map(completionRules, (rule) => {
    // const documentPosition = node.node.pos + 1;
    // const documentStart = rule.token.start + documentPosition;
    // const documentEnd = rule.token.end + documentPosition;
    // const replacementSpan: vscode.CompletionItem[''] = {
    //   start: node.document.document.offsetAt(
    //     node.templateContext.toPosition(documentStart),
    //   ),
    //   length:
    //     node.templateContext.toOffset(node.templateContext.toPosition(documentEnd)) -
    //     node.templateContext.toOffset(node.templateContext.toPosition(documentStart)),
    // };
    return completionRuleToEntry(rule, i++);
  }).pipe(HashSet.values, ReadonlyArray.fromIterable, ReadonlyArray.dedupe);
};

export function completionRulesToQuickInfo(
  completionRules: HashSet.HashSet<TwinRuleWithCompletion>,
  sheetEntry: FinalSheet,
): Option.Option<vscode.Hover> {
  return HashSet.map(completionRules, (rule) => {
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
    return completionRuleToQuickInfo(rule, sheetEntry);
  }).pipe(HashSet.values, (x) => ReadonlyArray.fromIterable(x), ReadonlyArray.head);
}

export function completionRuleToQuickInfo(
  item: TwinRuleWithCompletion,
  sheetEntry: FinalSheet,
): vscode.Hover {
  const documentation = getDocumentation(item, sheetEntry);

  return Data.struct({
    contents: [
      {
        language: vscode.MarkupKind.Markdown,
        value: documentation,
      },
    ],
  });
}
