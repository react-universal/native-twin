import {
  BaseTheme,
  CSSObject,
  CSSProperties,
  Context,
  MatchConverter,
  MatchResult,
  MaybeArray,
  RuleResolver,
} from '../types';

/**
 * @group Configuration
 * @param pattern
 * @param resolve
 * @param convert
 */
export function match<Theme extends BaseTheme = BaseTheme>(
  pattern: MaybeArray<string | RegExp>,
  resolve?: RuleResolver<Theme> | (string & {}) | CSSObject | keyof CSSProperties,
  convert?: MatchConverter<Theme>,
): [MaybeArray<string | RegExp>, RuleResolver<Theme>] {
  if (typeof resolve == 'function') {
    return [pattern, resolve];
  }
  if (typeof resolve == 'string' && /^[\w-]+$/.test(resolve)) {
    // console.log('MATCH', resolve);
    return [
      pattern,
      (match: MatchResult, context: Context<Theme>) => {
        // console.log('MATCH_CONVERT', convert);
        return {
          [resolve]: convert ? convert(match, context) : maybeNegate(match, 1),
        } as CSSObject;
      },
    ];
  }
  // console.log('MATCH_CONVERT', { resolve, pattern, convert });
  return [
    pattern,
    (match: MatchResult) => {
      // CSSObject, shortcut or apply
      // console.log('MMMM: ', match);
      return (
        resolve ||
        ({
          [match[1]! ?? resolve]: maybeNegate(match, 2),
        } as CSSObject)
      );
    },
  ];
}

function maybeNegate<T>(
  match: MatchResult,
  offset: number,
  value: T | string = match.slice(offset).find(Boolean) || match.$$ || match.input,
): T | string {
  // console.log('MAYBE: ', match, offset, value);
  return match.input[0] == '-' ? `calc(${value} * -1)` : value;
}
