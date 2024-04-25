import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import ts from 'typescript/lib/tsserverlibrary';
import * as vscode from 'vscode-languageserver-types';
import { NativeTwinService } from '../../native-twin/nativeTwin.service';
import { TwinRuleWithCompletion } from '../../native-twin/nativeTwin.types';
import { acquireTemplateNode } from '../../template/TemplateNode.service';
import { getCompletionEntryDetailsDisplayParts } from '../completions/completions.utils';
import { getDocumentation } from '../utils/documentation';

export const getQuickInfoAtPosition = (filename: string, position: number) => {
  return Effect.gen(function* ($) {
    const twinService = yield* $(NativeTwinService);
    const resource = yield* $(acquireTemplateNode(filename, position));

    const completionRules = Option.map(resource, (node) =>
      twinService.findRuleCompletions(
        node.getTokenAtPosition(node.positions.relative.offset),
        node.positions.relative.offset,
      ),
    );

    const quickInfo = Option.zipWith(resource, completionRules, (node, rules) => {
      return HashSet.map(rules, (rule) => {
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
        return createCompletionQuickInfo(rule.value, replacementSpan);
      }).pipe(HashSet.values, (x) => ReadonlyArray.fromIterable(x), ReadonlyArray.head);
    }).pipe(Option.flatten);

    return quickInfo;
  });
};

export function createCompletionQuickInfo(
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
