import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import ts from 'typescript';
import { IntellisenseService } from '../intellisense/intellisense.service';
import { acquireTemplateNode } from '../resources/template-node.resource';
import { completionRuleToEntry } from './completions.utils';

export const getCompletionsAtPosition = (filename: string, position: number) => {
  return Effect.gen(function* ($) {
    const intellisense = yield* $(IntellisenseService);

    const resource = yield* $(acquireTemplateNode(filename, position));

    // const node = helper.getTemplateNode(filename, position);
    // const templateContext = helper.getTemplateContext(node, position);
    // const parsedTemplate = Option.map(templateContext, (x) => parseTemplate(x.text)).pipe(
    //   Option.getOrElse((): TemplateTokenWithText[] => []),
    // );

    // const positions = Option.map(templateContext, (context) => {
    //   const templatePosition = helper.getRelativePosition(context, position);
    //   const textOffset = context.toOffset(templatePosition);
    //   const documentPosition = {
    //     start: context.node.getStart(),
    //     end: context.node.getEnd(),
    //   };
    //   return {
    //     templatePosition,
    //     textOffset,
    //     documentPosition,
    //   };
    // });

    // const tokenAtPosition = Option.map(positions, (x) =>
    //   getTokenAtPosition(parsedTemplate, x.textOffset),
    // );

    const completionRules = Option.map(resource, (node) => {
      return intellisense.findRuleCompletions(
        node.tokenAtPosition,
        node.positions.relative.offset,
      );
    });
    //  Option.zipWith(tokenAtPosition, positions, (token, pos) =>
    //   intellisense.findRuleCompletions(token, pos.textOffset),
    // );

    const completionEntries = Option.zipWith(resource, completionRules, (node, rules) => {
      
      return ReadonlyArray.map(rules, (rule, i) => {
        const documentPosition = node.node.pos + 1;
        const documentStart = rule.token.start + documentPosition;
        const documentEnd = rule.token.end + documentPosition;
        const replacementSpan: ts.TextSpan = {
          start: node.context.toOffset(node.context.toPosition(documentStart)),
          length:
            node.context.toOffset(node.context.toPosition(documentEnd)) -
            node.context.toOffset(node.context.toPosition(documentStart)),
        };
        return {
          ...completionRuleToEntry(rule, i),
          replacementSpan: replacementSpan,
        };
      });
    });

    return completionEntries.pipe(Option.getOrElse(() => [])) as ts.CompletionEntry[];
  });
};
