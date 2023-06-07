import { getSelectorGroup } from '../utils/helpers';
import type {
  AssertNextTokenFn,
  CssAtRuleNode,
  CssDeclarationValueNode,
  CssRuleNode,
  CssTransformValueNode,
  CssValueCalcNode,
  CssValueDimensionNode,
  CssDeclarationNode,
} from './types';

const validDimensionUnits = [
  'em',
  'rem',
  'px',
  '%',
  'vh',
  'vw',
  'deg',
  'ex',
  'in',
  'cn',
  'mm',
  'pt',
  'px',
  'vh',
  'vw',
] as const;

export const getNextRuleType = (
  nextChar: string,
): CssRuleNode['type'] | CssAtRuleNode['type'] => {
  if (!nextChar) {
    throw new SyntaxError(`Trying to get next rule type but got unexpected end of css.`);
  }
  return nextChar === '@' ? 'at-rule' : 'rule';
};

export const cssDimensionsValueToAst = (value: string): CssValueDimensionNode => {
  const matchUnits = /([+,-]?\d*[.|\d+]+?)(px|em|rem|ex|%|in|cn|mm|pt|pc|vh|vw+)?$/;
  const match = value.match(matchUnits);
  if (!match || !match[1]) {
    throw new SyntaxError(`Trying to parse dimensions value but got ${value}`);
  }
  return {
    type: 'dimensions',
    value: match[1]!,
    unit: match[2] ?? 'none',
  };
};

export const assertNextToken: AssertNextTokenFn = (condition, msg): asserts condition => {
  if (!condition) {
    throw new SyntaxError(msg);
  }
};

const isCssDimensionsValue = (value: string) => {
  if (value.includes(' ') || value.includes('(')) {
    return false;
  }
  const isValid = validDimensionUnits.some((item) => value.endsWith(item));
  return isValid;
};
const calcMatch = /calc\((.*[\w]|[\d])\s*([*/+\\-])\s*([\w-]+)\)/;

const cssCalcToAst = (value: string): CssValueCalcNode => {
  const match = value.match(calcMatch);
  if (!match) {
    throw new SyntaxError(`Trying to parse calc operation but got: ${value}`);
  }
  const [, left, operator, right] = match;
  if (!left || !operator || !right) {
    throw new SyntaxError(`Trying to parse calc operation but got: ${value}`);
  }
  return {
    type: 'calc',
    left: cssDimensionsValueToAst(left),
    operation: operator as CssValueCalcNode['operation'],
    right: cssDimensionsValueToAst(right),
  };
};

const cssTranslateToAst = (value: string): CssTransformValueNode => {
  const translateValue = value.slice(value.indexOf('(') + 1, value.indexOf(')'));
  const units = translateValue.split(',');
  const ast: CssDeclarationValueNode = {
    type: 'transform',
    dimension: '2d',
    x: {
      type: 'dimensions',
      unit: 'none',
      value: '0px',
    },
  };
  if (units[0] && units[0] !== '') {
    ast.x = cssDimensionsValueToAst(units[0]);
  }
  if (units[1] && units[1] !== '') {
    ast.y = cssDimensionsValueToAst(units[1]);
  }
  return ast;
};

const createDeclarationValueNode = (value: string): CssDeclarationValueNode => {
  const isDimensions = isCssDimensionsValue(value);
  if (isDimensions) {
    return cssDimensionsValueToAst(value);
  }
  if (value.startsWith('calc(')) {
    return cssCalcToAst(value);
  }

  if (value.startsWith('translate')) {
    return cssTranslateToAst(value);
  }

  return {
    type: 'raw',
    value: value,
  };
};

/**
 * Tokenize a list of declarations
 *
 * @param {string} rawDeclarations
 * @returns {(CssDeclarationListNode)}
 */
export const ruleDeclarationsToAst = (rawDeclarations: string): CssDeclarationNode[] => {
  const list = rawDeclarations.split(';');
  return list
    .filter((item) => item !== '')
    .map((current): CssDeclarationNode => {
      const [property, value] = current.split(':');
      assertNextToken(
        property && value,
        `Trying to get declaration property/value but got: ${rawDeclarations}`,
      );
      const declarationValueNode = createDeclarationValueNode(value);
      return {
        type: 'declaration',
        property,
        value: declarationValueNode,
      };
    });
};

/**
 * Tokenize a single css rule
 *
 * @param {string} css
 * @returns {(CssRuleNode | CssAtRuleNode)}
 */
export const cssInterPreter = (css: string): CssRuleNode | CssAtRuleNode => {
  let cursor = 0;
  const nextRuleType = getNextRuleType(css.charAt(0));
  const selectorEndIndex = css.slice(cursor).indexOf('{');
  assertNextToken(
    selectorEndIndex > 0,
    `Selectors: Trying to get selector but got ${css.slice(cursor, 10)}.`,
  );
  const selector = css.slice(cursor, selectorEndIndex);
  // Advance cursor to next token after "{" literal after selector
  cursor += selectorEndIndex + 1;

  const declarationsEndIndex = css.slice(cursor).indexOf('}');
  assertNextToken(
    declarationsEndIndex > 0,
    `Declarations: Trying to get rule but got ${css.slice(cursor, 10)}.`,
  );
  // Advance cursor to next token after "}"
  const rawRule = css.slice(cursor, cursor + declarationsEndIndex);
  const astRule = ruleDeclarationsToAst(rawRule);
  const declarationGroup = getSelectorGroup(selector);

  return {
    type: nextRuleType,
    declarations: astRule,
    selector,
    group: declarationGroup,
  };
};
