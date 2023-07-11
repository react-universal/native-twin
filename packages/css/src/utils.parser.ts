export const mapAsType =
  <A extends string>(type: A) =>
  <B>(value: B) => {
    return {
      type,
      value,
    };
  };

export const getPropertyValueType = (property: string) => {
  switch (property) {
    case 'color':
    case 'background-color':
    case 'border-color':
      return 'COLOR';

    case 'width':
    case 'height':
    case 'max-width':
    case 'max-height':
    case 'min-width':
    case 'min-height':
    case 'margin': // MARGIN DIMENSIONS
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
    case 'top': // POSITION
    case 'left':
    case 'bottom':
    case 'right':
    case 'border-top': // BORDER
    case 'border-left':
    case 'border-bottom':
    case 'border-right':
    case 'border-radius':
    case 'border-width':
    case 'border-top-left-radius':
    case 'border-top-right-radius':
    case 'border-bottom-left-radius':
    case 'border-bottom-right-radius':
    case 'z-index':
    case 'gap':
    case 'column-gap':
    case 'row-gap':
    case 'flex-grow':
    case 'flex-basis':
    case 'flex-shrink':
      return 'DIMENSION';
    case 'aspect-ratio':
      return 'MATH';
    case 'flex':
      return 'FLEX';

    case 'box-shadow':
      return 'SHADOW';

    case 'transform':
      return 'TRANSFORM';

    case 'font-family': // IDENT
      return 'FIRST-COMMA-IDENT';

    default:
      return 'RAW';
  }
};

export const unsupportedStyles = (property: string) => {
  if (property == 'display') {
    return {
      fallback: 'flex',
    };
  }
  return null;
};
