import type { ClassNameToken, ParsedRule } from '@universal-labs/css/tailwind';

/**
 * @description CSS Selector Escape
 */
export function escape(string: string) {
  return (
    string
      // Simplified escape testing only for chars that we know happen to be in tailwind directives
      .replace(/[!"'`*+.,;:\\/<=>?@#$%&^|~()[\]{}]/g, '\\$&')
      // If the character is the first character and is in the range [0-9] (2xl, ...)
      // https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
      .replace(/^\d/, '\\3$& ')
  );
}

export function parseClassNameTokens(...tokens: ClassNameToken[]): string {
  return tokens.reduce((prev, current, currentIndex) => {
    prev += current.value.n;
    if (currentIndex == tokens.length - 1) return prev;
    return prev;
  }, ``);
}

export function parsedRuleToString(rule: ParsedRule, mediaRules: string[]) {
  const fixedPoints = rule.v.reduce(
    (prev, current) => {
      if (mediaRules.includes(current)) {
        prev.prefix += `${current}:`;
      } else {
        prev.suffix += `:${current}`;
      }
      return prev;
    },
    {
      prefix: '.',
      suffix: '',
    },
  );
  return `${fixedPoints.prefix}${rule.i ? '!' : ''}${rule.n}${
    rule.m ? `/${rule.m.value}` : ''
  }${fixedPoints.suffix}`;
}

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
