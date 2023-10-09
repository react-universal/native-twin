/**
 * @description Returns the given value converted to kebab-case.
 * @example toCamelCase('paddingTop') => 'padding-top'
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
