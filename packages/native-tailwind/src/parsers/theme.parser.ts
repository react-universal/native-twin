import * as P from '@universal-labs/css/parser';
import type { MaybeColorValue } from '../types/theme.types';

// const cache = new WeakMap<any, string>();

export function createThemeObjectParser(base: string, themeObj: Record<string, string>) {
  const patternsParser: P.Parser<string> = P.choice(
    Object.keys(themeObj)
      .filter((x) => typeof themeObj[x] == 'string')
      .map((x) => P.literal(x)),
  );
  const ruleParser = P.sequenceOf([P.literal(base), patternsParser]).chain((result) => {
    if (result[1] in themeObj) {
      const data = themeObj[result[1]];
      if (data) return P.succeedWith(data);
    }
    return P.fail({
      message: `Theme section not found: ${result[0]}${result[1]}`,
      position: 0,
    });
  });
  return function tailwindThemeParser(token: string) {
    const parserData = ruleParser.run(token);
    if (parserData.isError) return null;
    return parserData.result;
  };
}

export function createThemeColorParser(
  base: string,
  themeObj: Record<string, MaybeColorValue>,
) {
  const patternsParser: P.Parser<string> = P.choice(
    Object.keys(themeObj)
      .filter((x) => typeof themeObj[x] == 'string')
      .map((x) => P.literal(x)),
  );
  const ruleParser = P.sequenceOf([P.literal(base), patternsParser]).chain((result) => {
    if (result[1] in themeObj) {
      let data = themeObj[result[1]];

      if (data) return P.succeedWith(data);
    }
    return P.fail({
      message: `Theme section not found: ${result[0]}${result[1]}`,
      position: 0,
    });
  });
  return function tailwindThemeParser(token: string) {
    const parserData = ruleParser.run(token);
    if (parserData.isError) return null;
    return parserData.result;
  };
}

export type ThemeObjectParser = ReturnType<typeof createThemeObjectParser>;
