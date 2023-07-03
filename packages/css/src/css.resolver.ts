import { SheetParser } from './css-parsers/css.parser';
import { getSelectorGroup } from './helpers';
import type { CssParserCache, CssParserData, SelectorGroup } from './types';

export const CreateCssResolver = () => {
  const cache: CssParserCache = new Map();

  return (target: string[], context: CssParserData) => {
    return target.reduce(
      (prev, current) => {
        if (cache.has(current)) {
          const cached = cache.get(current)!;
          Object.assign(prev[cached.group], cached.styles);
          return prev;
        }

        const parsed = SheetParser(context).run(current);

        if (parsed.isError) return prev;

        const group = getSelectorGroup(parsed.result.selector);
        Object.assign(prev[group], parsed.result.declarations);
        cache.set(current, {
          group,
          styles: parsed.result.declarations,
        });
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
