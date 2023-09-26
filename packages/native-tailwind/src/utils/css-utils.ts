import type { SelectorGroup } from '@universal-labs/css';
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

// export function parsedRuleToString(rule: ParsedRule, mediaRules: string[]) {
//   const fixedPoints = rule.v.reduce(
//     (prev, current) => {
//       if (mediaRules.includes(current)) {
//         prev.prefix += `${current}:`;
//       } else {
//         prev.suffix += `:${current}`;
//       }
//       return prev;
//     },
//     {
//       prefix: '.',
//       suffix: '',
//     },
//   );
//   return `${fixedPoints.prefix}${rule.i ? '!' : ''}${rule.n}${
//     rule.m ? `/${rule.m.value}` : ''
//   }${fixedPoints.suffix}`;
// }

export function getRuleSelectorGroup(rule: ParsedRule): SelectorGroup {
  if (rule.v.length == 0) return 'base';
  if (
    rule.v.includes('group') ||
    rule.v.includes('group-hover') ||
    rule.v.includes('group-active') ||
    rule.v.includes('group-focus')
  )
    return 'group';
  if (rule.v.includes('odd')) return 'odd';
  if (rule.v.includes('even')) return 'even';
  if (rule.v.includes('first')) return 'first';
  if (rule.v.includes('last')) return 'last';
  if (rule.v.includes('hover') || rule.v.includes('focus') || rule.v.includes('active'))
    return 'pointer';
  return 'base';
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
