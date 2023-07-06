import type { SelectorGroup } from './css.types';
import { ParseCssRules } from './lib/css/rules.parser';
import type { CssParserData } from './types';

export const CreateCssResolver = () => {
  const parseCssTarget = (target: string, context: CssParserData) => {
    const parsed = ParseCssRules.run(target, context);
    if (parsed.isError) return null;
    return parsed.result;
  };

  return function interpreter(target: string[], context: CssParserData) {
    return target.reduce(
      (prev, current) => {
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
