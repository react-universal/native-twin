import { getSelectorGroup } from '../helpers';

export const mapAsType =
  <A extends string>(type: A) =>
  <B>(value: B) => {
    return {
      type,
      value,
    };
  };

export const mapSelector = (selector: string) => ({
  group: getSelectorGroup(selector),
  value: selector,
});

export const getPropertyValueType = (property: string) => {
  switch (property) {
    case 'flex':
      return 'FLEX';
    case 'width':
    case 'height': // MARGIN DIMENSIONS
    case 'margin':
    case 'margin-top':
    case 'margin-left':
    case 'margin-bottom':
    case 'margin-right':
    case 'padding': // PADDING DIMENSIONS
    case 'padding-top':
    case 'padding-left':
    case 'padding-bottom':
    case 'padding-right':
    case 'line-height': // FONT DIMENSIONS
    case 'font-size':
      return 'DIMENSION';
    case 'color':
    case 'background-color':
      return 'COLOR';
    case 'box-shadow':
      return 'SHADOW';
    case 'transform':
      return 'TRANSFORM';
    default:
      return 'RAW';
  }
};
