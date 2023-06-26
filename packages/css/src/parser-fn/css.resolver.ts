import { CssRuleToken } from './CssTokens';
import type { AstRuleNode } from './types';

export const CreateCssResolver = () => {
  const cache = new Map<string, AstRuleNode>();
  return (target: string) => {
    if (cache.has(target)) {
      console.log('CACHE_HIT: ', cache.get(target)!.selector.value);
      return cache.get(target)!;
    }
    const response = CssRuleToken.run(target);
    if (response.isError) {
      console.warn('Parser Error: ', response);
      return {};
    }
    cache.set(target, response.result);
    return response.result;
  };
};

export const CssResolver = CreateCssResolver();
