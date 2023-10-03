/**
 * @description Returns the given value converted to kebab-case.
 * @example toCamelCase('paddingTop') => 'padding-top'
 * */
export const toHyphenCase = (value: string) =>
  // ignore kebab-like values
  value.includes('-')
    ? value
    : // replace any upper-case letter with a dash and the lower-case variant
      value.replace(/[A-Z]/g, (capital) => '-' + capital.toLowerCase());
