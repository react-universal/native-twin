import * as P from '@native-twin/arc-parser';
import { type RuleHandlerToken, getTWFeatureParser } from '@native-twin/css';
import type { Rule, RuleMeta } from '../types/config.types';
import type { __Theme__ } from '../types/theme.types';
import { __defaultRuleMeta } from './constants';

export class TwinRule<Theme extends __Theme__ = __Theme__> {
  private _patternParser: P.Parser<string>;
  private _parser: P.Parser<RuleHandlerToken>;

  get meta(): RuleMeta {
    return this.themeRule[3] ?? __defaultRuleMeta;
  }
  get themeSection() {
    return this.themeRule[1];
  }

  constructor(private readonly themeRule: Rule<Theme>) {
    const rawPattern = themeRule[0];
    if (rawPattern.includes('|')) {
      this._patternParser = P.choice(rawPattern.split('|').map((x) => P.literal(x)));
    } else {
      this._patternParser = P.literal(rawPattern);
    }
    this._parser = getTWFeatureParser(rawPattern, this._patternParser, this.meta.feature);
  }

  parse(token: string) {
    return this._parser.run(token);
  }
}
