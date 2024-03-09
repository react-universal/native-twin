/**
 * @description Returns a filled value with a dash prefix.
 * @param {string} value - The input to be converted to a tail dashed format.
 * @example
 * toTailDashed('padding') => 'padding-'
 * */
export const toTailDashed = (value: string) => (value ? value + '-' : '');
