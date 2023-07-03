import type { EvaluatorConfig, SelectorGroup } from '../types';
import { CssParserRoutine } from './css.parser';
import { getSelectorGroup } from './helpers';

export const CreateCssResolver = () => {
  const cache = new Map<
    string,
    {
      group: SelectorGroup;
      styles: Record<string, any>;
    }
  >();

  return (target: string[], context: EvaluatorConfig) => {
    return target.reduce(
      (prev, current) => {
        if (cache.has(current)) {
          const cached = cache.get(current)!;
          Object.assign(prev[cached.group], cached.styles);
          return prev;
        }

        const parsed = CssParserRoutine(current, context);

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
