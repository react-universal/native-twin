const getDefaultTokens = () => {
    return new Map([
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
const createSizeTokens = ([xs, sm, md, lg, xl]) => {
    const defaultTokens = getDefaultTokens();
    defaultTokens.set('xs', xs);
    defaultTokens.set('sm', sm);
    defaultTokens.set('md', md);
    defaultTokens.set('lg', lg);
    defaultTokens.set('xl', xl);
    return defaultTokens;
};
export { createSizeTokens };
