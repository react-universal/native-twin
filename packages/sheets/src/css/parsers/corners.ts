import { findNumbers } from './numbers';

/** Parses a css value for the corner of an element (border-radius) */
export function cornerValue(prefixKey: 'border', value: string, postFix: 'Radius') {
  const [topLeft, topRight = topLeft, bottomRight = topLeft, bottomLeft = topRight] =
    findNumbers(value).numbers;
  return {
    [prefixKey + 'TopLeft' + postFix]: topLeft,
    [prefixKey + 'TopRight' + postFix]: topRight,
    [prefixKey + 'BottomLeft' + postFix]: bottomLeft,
    [prefixKey + 'BottomRight' + postFix]: bottomRight,
  };
}
