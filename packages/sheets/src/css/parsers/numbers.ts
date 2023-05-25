/**
 * Split the value into numbers values and non numbers values
 * @param value The value to check
 * @param acceptAuto true if auto is an accepted value
 * @returns An object containing the number and non number values as arrays.
 */
export function findNumbers(value: string, acceptAuto?: boolean) {
  const result = {
    nonNumbers: [] as string[],
    numbers: [] as string[],
  };
  let group = '';
  value.split(/\s+/gm).forEach((val) => {
    // HACK: we prevent some parts of font-family names like "Rounded Mplus 1c" to be interpreted as numbers
    if (val.startsWith('"') || val.startsWith("'")) group = val.charAt(0);
    if (group && val.endsWith(group)) group = '';
    if (group) result.nonNumbers.push(val);
    else result[isNumber(val, acceptAuto) ? 'numbers' : 'nonNumbers'].push(val);
  });
  return result;
}

/**
 * Check if the value is a number. Numbers start with a digit, a decimal point or calc(, max( ou min(.
 * Optionally accept "auto" value (for margins)
 * @param value The value to check
 * @param acceptAuto true if auto is an accepted value
 * @returns true if the value is a number
 */
export function isNumber(value: string, acceptAuto?: boolean) {
  if (acceptAuto && value === 'auto') return true;
  return value.match(/^[+-]?(\.\d|\d|calc\(|max\(|min\()/gm);
}
