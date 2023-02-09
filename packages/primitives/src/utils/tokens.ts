export type SizesDesignTokens =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl';

const getDefaultTokens = () => {
  return new Map<SizesDesignTokens, number>([
    ['xs', 8],
    ['sm', 10],
    ['md', 12],
    ['lg', 14],
    ['xl', 16],
    ['2xl', 20],
    ['3xl', 24],
    ['4xl', 24],
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
