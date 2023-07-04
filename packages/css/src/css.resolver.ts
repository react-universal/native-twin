import { CssParser } from './css-parsers/css.recursive';
import { withData } from './lib';
import type { CssParserCache, CssParserData, SelectorGroup } from './types';

export const CreateCssResolver = () => {
  const cache: CssParserCache = new Map();

  const parseCssTarget = (target: string, context: CssParserData) => {
    const parsed = withData(CssParser)(context).run(target);
    if (parsed.isError) return null;
    return parsed.result;
  };

  const getCachedResult = (target: string) => {
    if (cache.has(target)) return cache.get(target);
    return undefined;
  };

  return function interpreter(target: string[], context: CssParserData) {
    return target.reduce(
      (prev, current) => {
        const cached = getCachedResult(current);
        if (cached) {
          Object.assign(prev[cached.group], cached.styles);
          return prev;
        }

        const parserResult = parseCssTarget(current, context);
        if (!parserResult) return prev;

        Object.assign(prev[parserResult.selector.group], parserResult.declarations);

        return prev;
      },
      {
        base: {},
        even: {},
        first: {},
        group: {},
        last: {},
        odd: {},
        pointer: {},
      } as Record<SelectorGroup, any>,
    );
  };
};

export const CssResolver = CreateCssResolver();
