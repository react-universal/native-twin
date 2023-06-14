import { Platform } from 'react-native';
import { parseCss } from '@universal-labs/css';
import type { StyleSheetStyleGroups } from '../types';
import type { Context } from './css.types';
import { evaluateDeclaration } from './parsers/declarations';
import type { CssAstNode, CssAtRuleNode, CssRuleNode, CssSheetNode } from './types';

// const cssParser = createCssParser({ rem: 16, deviceHeight: 1000, deviceWidth: 2000 });
const platformMatch = /web|ios|android|native+/;
const createTokenizer = () => {
  const cache = new Map<string, CssRuleNode | CssAtRuleNode>();

  return (target: string[], context: Context) => {
    const sheetNode: CssSheetNode = {
      type: 'sheet',
      rules: [],
    };
    const purged = target.filter((item) =>
      platformMatch.test(item) ? item.includes(Platform.OS) : true,
    );

    const parseNextRule = (current: string) => {
      if (cache.has(current)) {
        const seen = cache.get(current)!;
        sheetNode.rules.push(seen);
      } else {
        const nextRule = parseCss(current);
        // if (nextRule.isError) {
        //   return;
        // }
        console.log('NEXT_RULE: ', nextRule);
        // cache.set(current, nextRule.value);
      }
    };
    purged.forEach(parseNextRule);

    // @ts-ignore
    return evaluateCss(sheetNode, context);
  };
};

export const evaluateTwUtilities = createTokenizer();

function evaluateCss(
  ast: CssAstNode,
  context: Context,
  result: StyleSheetStyleGroups = {
    base: [],
    even: [],
    first: [],
    group: [],
    last: [],
    odd: [],
    pointer: [],
  },
) {
  switch (ast.type) {
    case 'sheet':
      ast.rules.forEach((rule) => {
        result = {
          ...result,
          ...evaluateCss(rule, context, result),
        };
      });
      return result;
    case 'rule':
      ast.declarations.forEach((current) =>
        result['base'].push(evaluateDeclaration(current.property, current.value, context)),
      );
      return result;
    default:
      throw new Error(`Not implemented evaluator for: ${JSON.stringify(ast)}`);
  }
}
