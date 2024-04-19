import * as Context from 'effect/Context';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as P from '@native-twin/arc-parser';
import {
  mergeParsedRuleGroupTokens,
  parseValidTokenRecursiveWeak,
} from '../template/template.parser';
import {
  LocatedGroupToken,
  LocatedParsedRule,
  LocatedParser,
  TemplateToken,
} from '../template/template.types';

export class ParserService extends Context.Tag('IntellisenseService')<
  ParserService,
  {
    parseTemplate: (template: string) => Option.Option<TemplateToken[]>;
    getTokenAtPosition: (
      tokens: TemplateToken[],
      position: number,
    ) => LocatedParsedRule[];
  }
>() {}

export const ParserServiceLive = Layer.succeed(
  ParserService,
  ParserService.of({
    parseTemplate: (template) => {
      const weakParser = P.sequenceOf([
        P.separatedBySpace(parseValidTokenRecursiveWeak),
        P.endOfInput,
      ]).run(template);
      if (weakParser.isError) {
        return Option.none();
      }

      return Option.some(weakParser.result[0]);
    },

    getTokenAtPosition: (tokens: TemplateToken[], position: number) => {
      const rangedTokens = tokens
        .filter((x) => position >= x.start && position <= x.end)
        .map((x) => {
          if (x.type === 'VARIANT') {
            return {
              ...x,
              type: 'GROUP',
              value: {
                base: x,
                content: [],
              },
              end: x.end,
              start: x.start,
            } satisfies LocatedParser<LocatedGroupToken>;
          }
          return x;
        });
      return mergeParsedRuleGroupTokens(rangedTokens);
    },
  }),
);
