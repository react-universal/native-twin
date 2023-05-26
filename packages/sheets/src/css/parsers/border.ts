import { isNumber } from './numbers';
import { sideValue } from './spaces';

/** Parse a css value for border */
export function border(value: string): { [x: string]: string } {
  const values = value.split(/\s+/gm);
  const result = {
    borderWidth: '0',
    borderColor: 'black',
    borderStyle: 'solid',
  };
  values.forEach((value: string) => {
    if (['solid', 'dotted', 'dashed'].includes(value)) result.borderStyle = value;
    else if (isNumber(value)) result.borderWidth = value;
    else if (value === 'none') return;
    else result.borderColor = value;
  });
  const payload = {
    ...sideValue('border', result.borderWidth, 'Width'),
    ...sideValue('border', result.borderColor, 'Color'),
    ...sideValue('border', result.borderStyle, 'Style'),
  };
  console.debug('BORDER_RESULT', payload);
  return payload;
}

/** Parse a css value for border-like elements */
export function borderLike(
  prefixKey: 'outline' | 'borderLeft' | 'borderRight' | 'borderTop' | 'borderBottom',
  value: string,
) {
  const values = value.split(/\s+/gm);
  const result = {
    [prefixKey + 'Width']: '0',
    [prefixKey + 'Color']: 'black',
    [prefixKey + 'Style']: 'solid',
  };
  if (value === 'none') return result;
  values.forEach((value: string) => {
    if (['solid', 'dotted', 'dashed'].includes(value)) result[prefixKey + 'Style'] = value;
    else if (isNumber(value)) result[prefixKey + 'Width'] = value;
    else result[prefixKey + 'Color'] = value;
  });
  console.debug('BORDER_LIKE_RESULT: ', { value, values, result });
  return result;
}
