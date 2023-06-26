import { CssRuleToken } from './CssTokens';

export const CreateCssResolver = () => {
  const cache = new Map<string, ReturnType<(typeof CssRuleToken)['run']>>();
  return (target: string) => {
    if (cache.has(target)) {
      return cache.get(target)!;
    }
    const result = CssRuleToken.run(target);
    cache.set(target, result);
    return result;
  };
};

export const CssResolver = CreateCssResolver();
