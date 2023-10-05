import * as P from '@universal-labs/arc-parser';
import type { Rule, RuleMeta, ThemeContext } from '../types/config.types';
import type {
  ArbitrarySegmentToken,
  RuleHandlerToken,
  SegmentToken,
  ParsedRule,
} from '../types/tailwind.types';
import type { __Theme__ } from '../types/theme.types';
import {
  cornersParser,
  edgesParser,
  gapParser,
  transform2dParser,
  transform3dParser,
} from './rules.parser';

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

export const createRuleResolver = <Theme extends __Theme__ = __Theme__>(rule: Rule<Theme>) => {
  const [rawPattern, _, resolver, meta] = rule;
  let patternParser = P.literal(rawPattern);
  const parser = getFeatureParser(rawPattern, patternParser, meta);
  return (token: ParsedRule, context: ThemeContext) => {
    const parserResult = parser.run(token.n);
    if (parserResult.isError) return null;
    const nextToken = resolver(parserResult.result, context, token);
    if (!nextToken) return null;
    return nextToken;
  };
};

const getFeatureParser = (
  pattern: string,
  patternParser: P.Parser<string>,
  meta: RuleMeta = {},
) => {
  const { feature = 'default' } = meta;
  switch (feature) {
    case 'edges':
      return resolveEdges(pattern, patternParser);
    case 'corners':
      return resolveCorners(pattern, patternParser);
    case 'gap':
      return resolveGap(patternParser);
    case 'transform-2d':
      return resolveTransform2d(pattern, patternParser);
    case 'transform-3d':
      return resolveTransform3d(pattern, patternParser);
    case 'colors':
    case 'default':
    default:
      return defaultResolver(pattern, patternParser);
  }
};

const defaultResolver = (pattern: string, patternParser: P.Parser<string>) => {
  if (!pattern.endsWith('-') || pattern.includes('|')) {
    return P.sequenceOf([maybeNegative, patternParser, P.endOfInput]).map(
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
    patternParser,
    P.choice([arbitraryParser, segmentParser]),
    P.endOfInput,
  ]).map((x) => ({
    segment: x[2],
    base: x[1],
    suffixes: [],
    negative: x[0],
  }));
};

const resolveCorners = (pattern: string, patternParser: P.Parser<string>) => {
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
};

const resolveTransform2d = (pattern: string, patternParser: P.Parser<string>) => {
  if (!pattern.endsWith('-')) {
    patternParser = P.sequenceOf([patternParser, P.maybe(P.char('-'))]).map((x) => x[0]);
  }
  return P.sequenceOf([
    maybeNegative,
    patternParser,
    P.maybe(transform2dParser),
    P.choice([arbitraryParser, segmentParser]),
    P.endOfInput,
  ]).map((x) => ({
    segment: x[3],
    base: x[1],
    negative: x[0],
    suffixes: x[2] ?? [],
  }));
};

const resolveTransform3d = (pattern: string, patternParser: P.Parser<string>) => {
  if (!pattern.endsWith('-')) {
    patternParser = P.sequenceOf([patternParser, P.maybe(P.char('-'))]).map((x) => x[0]);
  }
  return P.sequenceOf([
    maybeNegative,
    patternParser,
    P.maybe(transform3dParser),
    P.choice([arbitraryParser, segmentParser]),
    P.endOfInput,
  ]).map((x) => ({
    segment: x[3],
    base: x[1],
    negative: x[0],
    suffixes: x[2] ?? [],
  }));
};

const resolveGap = (patternParser: P.Parser<string>) => {
  return P.sequenceOf([
    maybeNegative,
    patternParser,
    P.maybe(gapParser),
    P.choice([arbitraryParser, segmentParser]),
    P.endOfInput,
  ]).map((x) => ({
    segment: x[3],
    base: x[1],
    negative: x[0],
    suffixes: x[2] ?? [],
  }));
};

const resolveEdges = (pattern: string, patternParser: P.Parser<string>) => {
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
};

// export class RuleHandler {
//   private patternParser: P.Parser<string>;
//   private ruleParser: P.Parser<RuleHandlerToken>;
//   constructor(private pattern: string, private feature: CssFeature) {
//     if (pattern.includes('|')) {
//       const parts = pattern.split('|');
//       this.patternParser = P.choice(parts.map((x) => P.literal(x)));
//     } else {
//       this.patternParser = P.literal(pattern);
//     }
//     if (this.feature == 'edges') {
//       this.ruleParser = this.resolveEdges();
//     } else if (this.feature == 'corners') {
//       this.ruleParser = this.resolveCorners();
//     } else if (this.feature == 'transform-2d') {
//       this.ruleParser = this.resolveTransform2d();
//     } else if (this.feature == 'transform-3d') {
//       this.ruleParser = this.resolveTransform3d();
//     } else if (this.feature == 'gap') {
//       this.ruleParser = this.resolveGap();
//     } else {
//       this.ruleParser = this.defaultResolver();
//     }
//   }

//   getParser() {
//     return this.ruleParser;
//   }

//   private defaultResolver() {
//     if (!this.pattern.endsWith('-')) {
//       return P.sequenceOf([maybeNegative, this.patternParser, P.endOfInput]).map(
//         (x): RuleHandlerToken => ({
//           segment: {
//             type: 'segment',
//             value: x[1],
//           },
//           base: x[1],
//           suffixes: [],
//           negative: x[0],
//         }),
//       );
//     }
//     if (this.pattern.includes('|')) {
//       return P.sequenceOf([maybeNegative, this.patternParser, P.endOfInput]).map(
//         (x): RuleHandlerToken => ({
//           segment: {
//             type: 'segment',
//             value: x[1],
//           },
//           base: x[1],
//           suffixes: [],
//           negative: x[0],
//         }),
//       );
//     }
//     return P.sequenceOf([
//       maybeNegative,
//       this.patternParser,
//       P.choice([arbitraryParser, segmentParser]),
//       P.endOfInput,
//     ]).map((x) => ({
//       segment: x[2],
//       base: x[1],
//       suffixes: [],
//       negative: x[0],
//     }));
//   }

//   private resolveCorners() {
//     if (!this.pattern.endsWith('-')) {
//       this.patternParser = P.sequenceOf([this.patternParser, P.maybe(P.char('-'))]).map(
//         (x) => x[0],
//       );
//     }
//     return P.sequenceOf([
//       maybeNegative,
//       this.patternParser,
//       P.maybe(cornersParser),
//       P.choice([arbitraryParser, segmentParser]),
//       P.endOfInput,
//     ]).map((x) => ({
//       segment: x[3],
//       base: x[1],
//       negative: x[0],
//       suffixes: x[2] ?? [],
//     }));
//   }

//   private resolveTransform2d() {
//     if (!this.pattern.endsWith('-')) {
//       this.patternParser = P.sequenceOf([this.patternParser, P.maybe(P.char('-'))]).map(
//         (x) => x[0],
//       );
//     }
//     return P.sequenceOf([
//       maybeNegative,
//       this.patternParser,
//       P.maybe(transform2dParser),
//       P.choice([arbitraryParser, segmentParser]),
//       P.endOfInput,
//     ]).map((x) => ({
//       segment: x[3],
//       base: x[1],
//       negative: x[0],
//       suffixes: x[2] ?? [],
//     }));
//   }

//   private resolveTransform3d() {
//     if (!this.pattern.endsWith('-')) {
//       this.patternParser = P.sequenceOf([this.patternParser, P.maybe(P.char('-'))]).map(
//         (x) => x[0],
//       );
//     }
//     return P.sequenceOf([
//       maybeNegative,
//       this.patternParser,
//       P.maybe(transform3dParser),
//       P.choice([arbitraryParser, segmentParser]),
//       P.endOfInput,
//     ]).map((x) => ({
//       segment: x[3],
//       base: x[1],
//       negative: x[0],
//       suffixes: x[2] ?? [],
//     }));
//   }

//   private resolveEdges() {
//     if (!this.pattern.endsWith('-')) {
//       this.patternParser = P.sequenceOf([this.patternParser, P.maybe(P.char('-'))]).map(
//         (x) => x[0],
//       );
//     }
//     return P.sequenceOf([
//       maybeNegative,
//       this.patternParser,
//       P.maybe(edgesParser),
//       P.choice([arbitraryParser, segmentParser]),
//       P.endOfInput,
//     ]).map((x) => ({
//       segment: x[3],
//       base: x[1],
//       negative: x[0],
//       suffixes: x[2] ?? [],
//     }));
//   }
//   private resolveGap() {
//     return P.sequenceOf([
//       maybeNegative,
//       this.patternParser,
//       P.maybe(gapParser),
//       P.choice([arbitraryParser, segmentParser]),
//       P.endOfInput,
//     ]).map((x) => ({
//       segment: x[3],
//       base: x[1],
//       negative: x[0],
//       suffixes: x[2] ?? [],
//     }));
//   }
// }
