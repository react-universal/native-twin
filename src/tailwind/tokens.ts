export type SizesDesignTokens = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const getDefaultTokens = () => {
  return new Map<SizesDesignTokens, number>([
    ['xs', 0],
    ['sm', 0],
    ['md', 0],
    ['lg', 0],
    ['xl', 0],
  ]);
};

const createSizeTokens = ([xs, sm, md, lg, xl]: [number, number, number, number, number]) => {
  const defaultTokens = getDefaultTokens();
  defaultTokens.set('xs', xs);
  defaultTokens.set('sm', sm);
  defaultTokens.set('md', md);
  defaultTokens.set('lg', lg);
  defaultTokens.set('xl', xl);
  return defaultTokens;
};

export { createSizeTokens };
