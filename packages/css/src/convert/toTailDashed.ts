/**
 * @description Returns a filled value with a dash prefix.
 * @example toCamelCase('padding') => 'padding-'
 * */
export const toTailDashed = (value: string) => (value ? value + '-' : '');
