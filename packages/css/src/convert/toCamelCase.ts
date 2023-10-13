/**
 * @description Returns the given value converted to camel-case.
 * @example toCamelCase('padding-top') => 'paddingTop'
 * */
export const toCamelCase = (value: string) =>
  !/[A-Z]/.test(value)
    ? value.replace(/-[^]/g, (capital) => capital.charAt(1).toUpperCase())
    : value;
