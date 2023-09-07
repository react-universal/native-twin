import type { RuleConfig } from '../../types/config.types';
import * as P from '@universal-labs/css/parser';
import type { ParsedRule } from '../../types/parser.types';
import type { BaseTheme } from '../../types/theme.types';

const themeValueParser = (sections: Record<string, string>, segment: string) =>
  new P.Parser((state) => {
    if (segment in sections) {
      console.log('RESULT: ', segment);
      return P.updateParserResult(state, sections[segment]);
    }
    return P.updateParserError(state, {
      message: `Segment ${segment} not matched by sections`,
      position: state.cursor,
    });
  });

export function matchThemeValue<Theme extends BaseTheme = BaseTheme>(
  pattern: string,
  _config: RuleConfig<Theme>,
) {
  const parser = P.literal(pattern);
  return (parsed: ParsedRule, sections: Record<string, string>) => {
    // console.log('PATTERNS: ', patterns);
    return P.sequenceOf<string, string>([
      parser,
      P.choice(
        Object.keys(sections)
          .filter((x) => typeof sections[x] !== 'object')
          .map((x): P.Parser<string> => P.literal(x)),
      ),
    ])
      .chain((result) => themeValueParser(sections, result[1]))
      .run(parsed.n);
  };
}
