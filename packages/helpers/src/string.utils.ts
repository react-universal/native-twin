/**
 * @description Returns the given value converted to camel-case.
 * @example toCamelCase('padding-top') => 'paddingTop'
 * */
export const toCamelCase = (value: string) =>
  !/[A-Z]/.test(value)
    ? value.replace(/-[^]/g, (capital) => capital.charAt(1).toUpperCase())
    : value;

/**
 * @description Returns the given value converted to kebab-case.
 * @example toHyphenCase('paddingTop') => 'padding-top'
 * */
export const toHyphenCase = (value: string) => {
  if (value.startsWith('Webkit')) {
    value.replace('Webkit', '-webkit');
  }
  if (value.startsWith('Moz')) {
    value.replace('Moz', '-moz');
  }
  if (value.startsWith('Ms')) {
    value.replace('Ms', '-ms');
  }
  return value.includes('-')
    ? value
    : // replace any upper-case letter with a dash and the lower-case variant
      value.replace(/[A-Z]/g, (capital) => '-' + capital.toLowerCase());
};

/**
 * @description Returns a filled value with a dash prefix.
 * @param {string} value - The input to be converted to a tail dashed format.
 * @example
 * toTailDashed('padding') => 'padding-'
 * */
export const toTailDashed = (value: string) => (value ? value + '-' : '');
