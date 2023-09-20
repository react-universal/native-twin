import { Parser } from '../parsers/Parser';
import { between } from '../parsers/between.parser';
import { choice } from '../parsers/choice.parser';
import { maybe } from '../parsers/maybe.parser';
import { sequenceOf } from '../parsers/sequence-of';
import { char, literal, regex } from '../parsers/string.parser';
import { endOfInput } from '../parsers/util.parsers';
import {
  ArbitrarySegmentToken,
  RuleHandlerToken,
  SegmentToken,
  CssFeature,
} from '../types/tailwind.types';
import {
  cornersParser,
  edgesParser,
  gapParser,
  transform2dParser,
  transform3dParser,
} from './rules.parser';

export class RuleHandler {
  private patternParser: Parser<string>;
  private ruleParser: Parser<RuleHandlerToken>;
  constructor(private pattern: string, private feature: CssFeature) {
    if (pattern.includes('|')) {
      const parts = pattern.split('|');
      this.patternParser = choice(parts.map((x) => literal(x)));
    } else {
      this.patternParser = literal(pattern);
    }
    if (this.feature == 'edges') {
      this.ruleParser = this.resolveEdges();
    } else if (this.feature == 'corners') {
      this.ruleParser = this.resolveCorners();
    } else if (this.feature == 'transform-2d') {
      this.ruleParser = this.resolveTransform2d();
    } else if (this.feature == 'transform-3d') {
      this.ruleParser = this.resolveTransform3d();
    } else if (this.feature == 'gap') {
      this.ruleParser = this.resolveGap();
    } else {
      this.ruleParser = this.defaultResolver();
    }
  }

  getParser() {
    return this.ruleParser;
  }

  private defaultResolver() {
    if (!this.pattern.endsWith('-')) {
      return sequenceOf([maybeNegative, this.patternParser, endOfInput]).map(
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
    if (this.pattern.includes('|')) {
      return sequenceOf([maybeNegative, this.patternParser, endOfInput]).map(
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
    return sequenceOf([
      maybeNegative,
      this.patternParser,
      choice([arbitraryParser, segmentParser]),
      endOfInput,
    ]).map((x) => ({
      segment: x[2],
      base: x[1],
      suffixes: [],
      negative: x[0],
    }));
  }

  private resolveCorners() {
    if (!this.pattern.endsWith('-')) {
      this.patternParser = sequenceOf([this.patternParser, maybe(char('-'))]).map((x) => x[0]);
    }
    return sequenceOf([
      maybeNegative,
      this.patternParser,
      maybe(cornersParser),
      choice([arbitraryParser, segmentParser]),
      endOfInput,
    ]).map((x) => ({
      segment: x[3],
      base: x[1],
      negative: x[0],
      suffixes: x[2] ?? [],
    }));
  }

  private resolveTransform2d() {
    if (!this.pattern.endsWith('-')) {
      this.patternParser = sequenceOf([this.patternParser, maybe(char('-'))]).map((x) => x[0]);
    }
    return sequenceOf([
      maybeNegative,
      this.patternParser,
      maybe(transform2dParser),
      choice([arbitraryParser, segmentParser]),
      endOfInput,
    ]).map((x) => ({
      segment: x[3],
      base: x[1],
      negative: x[0],
      suffixes: x[2] ?? [],
    }));
  }

  private resolveTransform3d() {
    if (!this.pattern.endsWith('-')) {
      this.patternParser = sequenceOf([this.patternParser, maybe(char('-'))]).map((x) => x[0]);
    }
    return sequenceOf([
      maybeNegative,
      this.patternParser,
      maybe(transform3dParser),
      choice([arbitraryParser, segmentParser]),
      endOfInput,
    ]).map((x) => ({
      segment: x[3],
      base: x[1],
      negative: x[0],
      suffixes: x[2] ?? [],
    }));
  }

  private resolveEdges() {
    if (!this.pattern.endsWith('-')) {
      this.patternParser = sequenceOf([this.patternParser, maybe(char('-'))]).map((x) => x[0]);
    }
    return sequenceOf([
      maybeNegative,
      this.patternParser,
      maybe(edgesParser),
      choice([arbitraryParser, segmentParser]),
      endOfInput,
    ]).map((x) => ({
      segment: x[3],
      base: x[1],
      negative: x[0],
      suffixes: x[2] ?? [],
    }));
  }
  private resolveGap() {
    return sequenceOf([
      maybeNegative,
      this.patternParser,
      maybe(gapParser),
      choice([arbitraryParser, segmentParser]),
      endOfInput,
    ]).map((x) => ({
      segment: x[3],
      base: x[1],
      negative: x[0],
      suffixes: x[2] ?? [],
    }));
  }
}

const classNameIdent = /^[a-z0-9A-Z-.]+/;
const arbitraryIdent = /^[a-z0-9A-Z-.#]+/;
const segmentParser = regex(classNameIdent).map(
  (x): SegmentToken => ({
    type: 'segment',
    value: x,
  }),
);

const maybeNegative = maybe(char('-')).map((x) => !!x);

const betweenSquareBrackets = between(char('['))(char(']'));
const arbitraryParser = betweenSquareBrackets(regex(arbitraryIdent)).map(
  (x): ArbitrarySegmentToken => ({
    type: 'arbitrary',
    value: x,
  }),
);
