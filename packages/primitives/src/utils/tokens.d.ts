export type SizesDesignTokens = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
declare const createSizeTokens: ([xs, sm, md, lg, xl]: [number, number, number, number, number]) => Map<SizesDesignTokens, number>;
export { createSizeTokens };
