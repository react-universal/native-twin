import { HashSet, ReadonlyArray } from 'effect';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import ts from 'typescript';
import { NativeTwinService } from '../native-twin/nativeTwin.service';
import { acquireTemplateNode } from '../template/TemplateNode.service';
import { completionRuleToEntry, createCompletionEntryDetails } from './completions.utils';

export const getCompletionsAtPosition = (filename: string, position: number) => {
  return Effect.gen(function* ($) {
    const twinService = yield* $(NativeTwinService);

    const resource = yield* $(acquireTemplateNode(filename, position));

    const completionRules = Option.map(resource, (node) =>
      twinService.findRuleCompletions(
        node.getTokenAtPosition(node.positions.relative.offset),
        node.positions.relative.offset,
      ),
    );

    const completionEntries = Option.zipWith(resource, completionRules, (node, rules) => {
      let i = 0;
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
        return completionRuleToEntry(rule, replacementSpan, i++);
      }).pipe(HashSet.values, (x) => Array.from(x));
    });

    return completionEntries.pipe(Option.getOrElse(() => [])) as ts.CompletionEntry[];
  });
};

export const getCompletionEntryDetails = (
  _filename: string,
  _position: number,
  name: string,
) => {
  return Effect.gen(function* ($) {
    const twinService = yield* $(NativeTwinService);

    const completionEntryDetails = twinService.store.twinRules.pipe(
      HashSet.filter((x) => x.completion.className === name),
      HashSet.map((x) => createCompletionEntryDetails(x)),
      HashSet.values,
      (x) => Array.from(x),
      ReadonlyArray.fromIterable,
      ReadonlyArray.head,
    );

    return completionEntryDetails;
  });
};
