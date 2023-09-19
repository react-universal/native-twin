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
    case 'backgroundColor':
    case 'borderColor':
      return 'COLOR';

    case 'width':
    case 'height':
    case 'maxWidth':
    case 'maxHeight':
    case 'minWidth':
    case 'minHeight':
    case 'margin': // MARGIN DIMENSIONS
    case 'marginTop':
    case 'marginLeft':
    case 'marginBottom':
    case 'marginRight':
    case 'padding': // PADDING DIMENSIONS
    case 'paddingTop':
    case 'paddingLeft':
    case 'paddingBottom':
    case 'paddingRight':
    case 'lineHeight': // FONT DIMENSIONS
    case 'fontSize':
    case 'top': // POSITION
    case 'left':
    case 'bottom':
    case 'right':
    case 'borderTop': // BORDER
    case 'borderLeft':
    case 'borderBottom':
    case 'borderRight':
    case 'borderRadius':
    case 'borderWidth':
    case 'borderTopLeftRadius':
    case 'borderTopRightRadius':
    case 'borderBottomLeftRadius':
    case 'border-bottomRightRadius':
    case 'zIndex':
    case 'gap':
    case 'columnGap':
    case 'rowGap':
    case 'flexGrow':
    case 'flexBasis':
    case 'flexShrink':
    case 'spacing':
      return 'DIMENSION';
    case 'aspectRatio':
      return 'MATH';
    case 'flex':
      return 'FLEX';

    case 'boxShadow':
      return 'SHADOW';

    case 'transform':
      return 'TRANSFORM';

    case 'fontFamily': // IDENT
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
