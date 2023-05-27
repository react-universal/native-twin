import { normalizeCssSelectorString } from '../utils/helpers';
import type {
  CssDeclarationAstNode,
  CssLexerState,
  CssRuleAstNode,
  CssSheetAstNode,
} from './css.types';
import {
  removeCssComment,
  selectorIsGroupPointerEvent,
  selectorIsPointerEvent,
} from './helpers';

export function tokenizer(
  css: string,
  rootNode: CssSheetAstNode = {
    type: 'sheet',
    rules: [],
  },
): CssSheetAstNode {
  let currentState: CssLexerState = {
    cursor: 0,
    targetString: removeCssComment(css),
  };
  const isSelector = currentState.targetString[currentState.cursor] === '.';
  if (isSelector) {
    const endOfSelector = currentState.targetString.indexOf('{');
    const selector = currentState.targetString.slice(currentState.cursor, endOfSelector);

    currentState.cursor = endOfSelector;
    const nextChar = currentState.targetString[currentState.cursor];
    if (nextChar === '{') {
      currentState.cursor += 1;
      const endOfDeclarations = currentState.targetString.indexOf('}');
      const ruleDeclarations = currentState.targetString.slice(
        currentState.cursor,
        endOfDeclarations,
      );
      currentState.cursor = endOfDeclarations + 1;
      rootNode.rules.push(
        createCssRuleNode(
          selector,
          ruleDeclarations,
          currentState.targetString.slice(0, currentState.cursor),
        ),
      );
      if (currentState.cursor < currentState.targetString.length) {
        return tokenizer(currentState.targetString.slice(currentState.cursor), rootNode);
      }
    }
  }
  return rootNode;
}

export const getDeclarationKind = (
  property: string,
  value: string,
): CssDeclarationAstNode['kind'] => {
  if (property.startsWith('--')) return 'variable';
  else if (property.includes('flex')) return 'flex';
  else if (
    property.includes('color') ||
    value.startsWith('#') ||
    value.startsWith('hls') ||
    value.startsWith('rgb')
  )
    return 'color';
  else if (property.includes('transform')) return 'transform';
  return 'style';
};

export const createDeclarationNode = (declarations: string): CssDeclarationAstNode[] => {
  const declarationRows = declarations.split(';');
  return declarationRows.reduce((prev, current) => {
    const [property, value] = current.split(':');
    if (property && value) {
      prev.push({
        type: 'declaration',
        rawDeclaration: current,
        kind: getDeclarationKind(property, value),
        declaration: {
          property,
          value,
        },
      });
    }
    return prev;
  }, [] as CssDeclarationAstNode[]);
};

export const createCssRuleNode = (
  rawSelector: string,
  declarations: string,
  fullRule: string,
): CssRuleAstNode => {
  const selector = normalizeCssSelectorString(rawSelector);
  const isGroupPointerEvent = selectorIsGroupPointerEvent(selector);
  const isPointerEvent = !isGroupPointerEvent && selectorIsPointerEvent(selector);
  const value = createDeclarationNode(declarations);

  return {
    type: 'rule',
    declarations: value,
    isGroupEvent: isGroupPointerEvent,
    isPointerEvent,
    rawDeclarations: declarations,
    rawSelector,
    selector,
    rawRule: fullRule,
    // getStyles: (context): Style => parseDeclarations(`${body};`, context),
  };
};
