import { Node, stringify } from 'postcss-value-parser';
import cssColorKeywords from './transforms/colors.json';

const matchString = (node: any) => {
  if (node.type !== 'string') return null;
  return node.value
    .replace(/\\([0-9a-f]{1,6})(?:\s|$)/gi, (match: any, charCode: string) =>
      String.fromCharCode(parseInt(charCode, 16)),
    )
    .replace(/\\/g, '');
};

const hexColorRe = /^(#(?:[0-9a-f]{3,4}){1,2})$/i;
const cssFunctionNameRe = /^(rgba?|hsla?|hwb|lab|lch|gray|color)$/;

const matchColor = (node: Node) => {
  if (
    node.type === 'word' &&
    (hexColorRe.test(node.value) ||
      node.value in cssColorKeywords ||
      node.value === 'transparent')
  ) {
    return node.value;
  } else if (node.type === 'function' && cssFunctionNameRe.test(node.value)) {
    return stringify(node);
  }
  return null;
};

const noneRe = /^(none)$/i;
const autoRe = /^(auto)$/i;
const identRe = /(^-?[_a-z][_a-z0-9-]*$)/i;
// Note if these are wrong, you'll need to change index.js too
const numberRe = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?)$/i;
// Note lengthRe is sneaky: you can omit units for 0
const lengthRe = /^(0$|(?:[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?)(?=px$))/i;
const unsupportedUnitRe =
  /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?(ch|em|ex|rem|vh|vw|vmin|vmax|cm|mm|in|pc|pt))$/i;
const angleRe = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?(?:deg|rad))$/i;
const percentRe = /^([+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?%)$/i;

const noopToken = (predicate: any) => (node: any) => predicate(node) ? '<token>' : null;

const valueForTypeToken = (type: any) => (node: any) => node.type === type ? node.value : null;

export const regExpToken =
  <T extends StringConstructor | NumberConstructor | ((...values: any) => any)>(
    regExp: RegExp,
    transform?: T,
  ) =>
  (node: any) => {
    if (node.type !== 'word') return null;

    const match = node.value.match(regExp);
    if (match === null) return null;

    const value = transform ? transform(match[1]) : String(match[1]);

    return value;
  };

export const SPACE = noopToken((node: any) => node.type === 'space');
export const SLASH = noopToken((node: any) => node.type === 'div' && node.value === '/');
export const COMMA = noopToken((node: any) => node.type === 'div' && node.value === ',');
export const WORD = valueForTypeToken('word');
export const NONE = regExpToken(noneRe);
export const AUTO = regExpToken(autoRe);
export const NUMBER = regExpToken(numberRe, Number);
export const LENGTH = regExpToken(lengthRe, Number);
export const UNSUPPORTED_LENGTH_UNIT = regExpToken(unsupportedUnitRe);
export const ANGLE = regExpToken(angleRe, (angle: string) => angle.toLowerCase());
export const PERCENT = regExpToken(percentRe);
export const IDENT = regExpToken(identRe);
export const STRING = matchString;
export const COLOR = matchColor;
export const LINE = regExpToken(/^(none|underline|line-through)$/i);
