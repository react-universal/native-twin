import { findNumbers } from './numbers';

/** Parses a css value for the side of an element (border-width, margin, padding) */
export function sideValue<T extends 'padding' | 'margin' | 'border'>(
  prefixKey: T,
  value: string,
  postFix: T extends 'border' ? 'Width' | 'Style' | 'Color' | '' : '' = '',
): { [x: string]: string } {
  if (value === 'none') return sideValue(prefixKey, '0', postFix);
  const [top = value, right = top, bottom = top, left = right] = findNumbers(
    value,
    prefixKey === 'margin',
  ).numbers;
  const result = {
    [prefixKey + 'Top' + postFix]: top,
    [prefixKey + 'Left' + postFix]: left,
    [prefixKey + 'Right' + postFix]: right,
    [prefixKey + 'Bottom' + postFix]: bottom,
  };
  console.group('SIDE_VALUE');
  console.debug('VALUE', value);
  console.debug('PREFIX_KEY: ', prefixKey);
  console.debug('POST: ', postFix);
  console.debug('RESULT: ', result);
  console.groupEnd();
  return result;
}
