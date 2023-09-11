import * as P from '@universal-labs/css/parser';
import type { Rule } from '../../types/config.types';
import type { ParsedRule } from '../../types/parser.types';
import type { __Theme__ } from '../../types/theme.types';

const themeValueParser = (sections: Record<string, string>, segment: string) =>
  new P.Parser((state) => {
    if (segment in sections) {
      return P.updateParserResult(state, sections[segment]);
    }
    return P.updateParserError(state, {
      message: `Segment ${segment} not matched by sections`,
      position: state.cursor,
    });
  });

export function matchThemeValue<Theme extends __Theme__ = __Theme__>(
  pattern: string,
  _config: Rule<Theme>,
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
