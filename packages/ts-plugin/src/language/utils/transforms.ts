import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import ts from 'typescript';
import * as vscode from 'vscode-languageserver-types';
import { NativeTwinService } from '../../native-twin/nativeTwin.service';
import {
  TwinRuleCompletionWithToken,
  TwinRuleWithCompletion,
} from '../../native-twin/nativeTwin.types';
import { TemplateNodeShape } from '../../template/template.context';
import {
  CompletionPart,
  getCompletionEntryDetailsDisplayParts,
  getCompletionParts,
  getCompletionTokenKind,
  getDocumentation,
  getKindModifiers,
} from './language.utils';

export const createCompletionsWithToken = (
  template: Option.Option<TemplateNodeShape>,
) => {
  return Effect.gen(function* ($) {
    const twinService = yield* $(NativeTwinService);
    const positionTokens: CompletionPart[] = Option.map(template, (node) =>
      pipe(
        ReadonlyArray.fromIterable(node.parsedTemplate),
        ReadonlyArray.map((x) => getCompletionParts(x)),
        ReadonlyArray.flatten,
      ),
    ).pipe(Option.getOrElse(() => []));

    return pipe(
      twinService.store.twinRules,
      HashSet.flatMap((ruleInfo) => {
        return HashSet.fromIterable(positionTokens).pipe(
          HashSet.filter((x) => ruleInfo.completion.className.startsWith(x.text)),
          HashSet.map(
            (token): TwinRuleCompletionWithToken => ({
              value: ruleInfo,
              token,
            }),
          ),
        );
      }),
    );
  });
};

export const filterCompletionByTemplateOffset = (
  tokens: HashSet.HashSet<TwinRuleCompletionWithToken>,
  position: number,
) => HashSet.filter(tokens, (x) => position >= x.token.start && position <= x.token.end);

export const completionRuleToEntry = (
  completionRule: TwinRuleCompletionWithToken,
  replacementSpan: ts.TextSpan,
  index: number,
): ts.CompletionEntry => {
  const { value } = completionRule;
  return {
    kind: getCompletionTokenKind(completionRule),
    filterText: value.completion.className,
    kindModifiers: getKindModifiers(value.rule),
    name: value.completion.className,
    sortText: index.toString().padStart(8, '0'),
    sourceDisplay: getCompletionEntryDetailsDisplayParts({
      completion: value.completion,
      composition: value.composition,
      rule: value.rule,
    }),
    replacementSpan,
    insertText: value.completion.className,
    source: value.completion.className,
    isRecommended: true,
  };
};

export const completionRulesToEntries = (
  node: TemplateNodeShape,
  completionRules: HashSet.HashSet<TwinRuleCompletionWithToken>,
) => {
  let i = 0;
  return HashSet.map(completionRules, (rule) => {
    const documentPosition = node.node.pos + 1;
    const documentStart = rule.token.start + documentPosition;
    const documentEnd = rule.token.end + documentPosition;
    const replacementSpan: ts.TextSpan = {
      start: node.templateContext.toOffset(
        node.templateContext.toPosition(documentStart),
      ),
      length:
        node.templateContext.toOffset(node.templateContext.toPosition(documentEnd)) -
        node.templateContext.toOffset(node.templateContext.toPosition(documentStart)),
    };
    return completionRuleToEntry(rule, replacementSpan, i++);
  }).pipe(HashSet.values, (x) => Array.from(x));
};

export function completionRulesToQuickInfo(
  node: TemplateNodeShape,
  completionRules: HashSet.HashSet<TwinRuleCompletionWithToken>,
): Option.Option<ts.QuickInfo> {
  return HashSet.map(completionRules, (rule) => {
    const documentPosition = node.node.pos + 1;
    const documentStart = rule.token.start + documentPosition;
    const documentEnd = rule.token.end + documentPosition;
    const replacementSpan: ts.TextSpan = {
      start: node.templateContext.toOffset(
        node.templateContext.toPosition(documentStart),
      ),
      length:
        node.templateContext.toOffset(node.templateContext.toPosition(documentEnd)) -
        node.templateContext.toOffset(node.templateContext.toPosition(documentStart)),
    };
    return completionRuleToQuickInfo(rule.value, replacementSpan);
  }).pipe(HashSet.values, (x) => ReadonlyArray.fromIterable(x), ReadonlyArray.head);
}

export function completionRuleToQuickInfo(
  item: TwinRuleWithCompletion,
  replacementSpan: ts.TextSpan,
): ts.QuickInfo {
  const displayParts = getCompletionEntryDetailsDisplayParts(item);
  const documentation = getDocumentation(item);
  return {
    kind: ts.ScriptElementKind.string,
    kindModifiers: displayParts.length > 0 ? 'color' : '',
    displayParts,
    textSpan: replacementSpan,
    documentation: [
      {
        kind: vscode.MarkupKind.Markdown,
        text: documentation,
      },
    ],
  };
}
