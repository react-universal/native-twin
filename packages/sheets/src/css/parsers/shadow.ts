import { findNumbers } from './numbers';

export function shadow(
  prefix: 'textShadow' | 'shadow',
  value: string,
): { [x: string]: string | { width: string; height: string } } {
  if (value === 'none') return shadow(prefix, '0 0 0 black');
  const { nonNumbers, numbers } = findNumbers(value);
  return {
    [prefix + 'Offset']: { width: numbers[0] || '0', height: numbers[1] || '0' },
    [prefix + 'Radius']: numbers[2] || '0',
    [prefix + 'Color']: nonNumbers[0] || 'black',
  };
}
