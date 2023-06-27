import type { AstRuleNode } from '../types';
import { CssParserRoutine } from './Evaluator';

export const CreateCssResolver = () => {
  const cache = new Map<string, AstRuleNode>();

  return (target: string[]) => {
    const sheet: Record<string, any> = {};
    target.forEach((current) => {
      if (cache.has(current)) {
        // sheet.push(cache.get(current)!);
        Object.assign(sheet, cache.get(current)!);
      } else {
        const response = CssParserRoutine(current);
        if (!response.isError) {
          // console.warn('Parser Error: ', { response, target });
          // @ts-expect-error
          cache.set(current, response.result.declarations);
          // sheet.push(cache.get(current)!);
          Object.assign(sheet, cache.get(current)!);
        }
      }
    });
    return sheet;
  };
};

export const CssResolver = CreateCssResolver();
