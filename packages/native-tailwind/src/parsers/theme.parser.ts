import * as P from '@universal-labs/css/parser';
import type { RuleMeta, RuleResolver, ThemeContext } from '../types/config.types';
import type {
  ArbitrarySegmentToken,
  ParsedRule,
  RuleHandlerToken,
  SegmentToken,
} from '../types/parser.types';
import type { __Theme__ } from '../types/theme.types';
import { cornersParser, edgesParser, gapParser } from './rules.parser';

const classNameIdent = /^[a-z0-9A-Z-.]+/;
const arbitraryIdent = /^[a-z0-9A-Z-.#]+/;
const segmentParser = P.regex(classNameIdent).map(
  (x): SegmentToken => ({
    type: 'segment',
    value: x,
  }),
);

const maybeNegative = P.maybe(P.char('-')).map((x) => !!x);

const betweenSquareBrackets = P.between(P.char('['))(P.char(']'));
const arbitraryParser = betweenSquareBrackets(P.regex(arbitraryIdent)).map(
  (x): ArbitrarySegmentToken => ({
    type: 'arbitrary',
    value: x,
  }),
);

export function buildRuleHandlerParser(
  pattern: string,
  meta: RuleMeta = {
    canBeNegative: false,
    feature: 'default',
    prefix: undefined,
    suffix: undefined,
  },
): P.Parser<RuleHandlerToken> {
  let patternParser = P.literal(pattern);

  switch (meta.feature) {
    case 'edges':
      if (!pattern.endsWith('-')) {
        patternParser = P.sequenceOf([patternParser, P.maybe(P.char('-'))]).map((x) => x[0]);
      }
      return P.sequenceOf([
        maybeNegative,
        patternParser,
        P.maybe(edgesParser),
        P.choice([arbitraryParser, segmentParser]),
        P.endOfInput,
      ]).map((x) => ({
        segment: x[3],
        base: x[1],
        negative: x[0],
        suffixes: x[2] ?? [],
      }));
    case 'corners':
      if (!pattern.endsWith('-')) {
        patternParser = P.sequenceOf([patternParser, P.maybe(P.char('-'))]).map((x) => x[0]);
      }
      return P.sequenceOf([
        maybeNegative,
        patternParser,
        P.maybe(cornersParser),
        P.choice([arbitraryParser, segmentParser]),
        P.endOfInput,
      ]).map((x) => ({
        segment: x[3],
        base: x[1],
        negative: x[0],
        suffixes: x[2] ?? [],
      }));
    default:
      return P.sequenceOf([
        maybeNegative,
        patternParser,
        P.choice([arbitraryParser, segmentParser]),
        P.endOfInput,
      ]).map((x) => ({
        segment: x[2],
        base: x[1],
        suffixes: [],
        negative: x[0],
      }));
  }
}

export class RuleHandler<Theme extends __Theme__ = {}> {
  private patternParser: P.Parser<string>;
  private ruleParser: P.Parser<RuleHandlerToken>;
  constructor(
    private pattern: string,
    private resolver: RuleResolver<Theme>,
    private meta: RuleMeta,
  ) {
    if (pattern.includes('|')) {
      const parts = pattern.split('|');
      this.patternParser = P.choice(parts.map((x) => P.literal(x)));
    } else {
      this.patternParser = P.literal(pattern);
    }
    if (this.meta.feature == 'edges') {
      this.ruleParser = this.resolveEdges();
    } else if (this.meta.feature == 'corners') {
      this.ruleParser = this.resolveCorners();
    } else if (this.meta.feature == 'gap') {
      this.ruleParser = this.resolveGap();
    } else {
      this.ruleParser = this.defaultResolver();
    }
  }

  run(token: ParsedRule, context: ThemeContext<Theme>) {
    const result = this.ruleParser
      .map((x) => {
        return this.resolver(x, context, token);
      })
      .run(token.n);
    if (result.isError) return;
    return result.result;
  }

  private defaultResolver() {
    if (this.pattern.includes('|')) {
      return P.sequenceOf([maybeNegative, this.patternParser, P.endOfInput]).map(
        (x): RuleHandlerToken => ({
          segment: {
            type: 'segment',
            value: x[1],
          },
          base: x[1],
          suffixes: [],
          negative: x[0],
        }),
      );
    }
    return P.sequenceOf([
      maybeNegative,
      this.patternParser,
      P.choice([arbitraryParser, segmentParser]),
      P.endOfInput,
    ]).map((x) => ({
      segment: x[2],
      base: x[1],
      suffixes: [],
      negative: x[0],
    }));
  }

  private resolveCorners() {
    if (!this.pattern.endsWith('-')) {
      this.patternParser = P.sequenceOf([this.patternParser, P.maybe(P.char('-'))]).map(
        (x) => x[0],
      );
    }
    return P.sequenceOf([
      maybeNegative,
      this.patternParser,
      P.maybe(cornersParser),
      P.choice([arbitraryParser, segmentParser]),
      P.endOfInput,
    ]).map((x) => ({
      segment: x[3],
      base: x[1],
      negative: x[0],
      suffixes: x[2] ?? [],
    }));
  }

  private resolveEdges() {
    if (!this.pattern.endsWith('-')) {
      this.patternParser = P.sequenceOf([this.patternParser, P.maybe(P.char('-'))]).map(
        (x) => x[0],
      );
    }
    return P.sequenceOf([
      maybeNegative,
      this.patternParser,
      P.maybe(edgesParser),
      P.choice([arbitraryParser, segmentParser]),
      P.endOfInput,
    ]).map((x) => ({
      segment: x[3],
      base: x[1],
      negative: x[0],
      suffixes: x[2] ?? [],
    }));
  }
  private resolveGap() {
    return P.sequenceOf([
      maybeNegative,
      this.patternParser,
      P.maybe(gapParser),
      P.choice([arbitraryParser, segmentParser]),
      P.endOfInput,
    ]).map((x) => ({
      segment: x[3],
      base: x[1],
      negative: x[0],
      suffixes: x[2] ?? [],
    }));
  }
}
