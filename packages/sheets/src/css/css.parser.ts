import { Dimensions, Platform } from 'react-native';
import { initialize, parse as parseTxClassNames } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import type {
  AnyStyle,
  CssDeclarationAstNode,
  CssRuleAstNode,
  CssSheetAstNode,
} from './css.types';
import { cssStyleToRN } from './declarations';
import { replaceCSSValueVariables } from './helpers';
import { createContext } from './parsers/mediaQueries';
import { cssDeclarationParser } from './parsers/property.parser';
import { tokenizer } from './tokenizer';

const { width, height } = Dimensions.get('screen');

interface CssParser {
  (config?: Config, rem?: number): (...args: string[]) => {
    ast: CssSheetAstNode;
    evaluated: ParserStylesResult;
    isGroupParent: boolean;
  };
}

interface ParserStylesResult {
  base: AnyStyle;
  pointer: AnyStyle;
  group: AnyStyle;
  even: AnyStyle;
  odd: AnyStyle;
  first: AnyStyle;
  last: AnyStyle;
  parsed: Record<string, AnyStyle>;
}

export const cssParser: CssParser = (config, rem = 16) => {
  const evaluatedRules = new Map<string, AnyStyle>();
  const context = createContext({
    rem,
    em: rem,
    cm: 37.8,
    mm: 3.78,
    in: 96,
    pt: 1.33,
    pc: 16,
    px: 1,
    height,
    width,
    vmin: width < height ? width : height,
    vmax: width > height ? width : height,
    vw: width,
    vh: height,
    '%': 0,
  });

  const { tw, tx } = initialize({
    colors: {
      ...config?.theme?.colors,
    },
    fontFamily: {
      ...config?.theme?.fontFamily,
    },
  });

  const evaluateDeclaration = (node: CssDeclarationAstNode): AnyStyle => {
    const parsed = cssDeclarationParser(node.declaration.property, node.declaration.value);
    return cssStyleToRN(parsed, context) as AnyStyle;
  };

  const applyRule = (node: CssRuleAstNode) => {
    const finalStyle = node.declarations.reduce(
      (prev, current) => {
        if (current.kind === 'variable') {
          prev.variables[current.declaration.property] = current.declaration.value;
          return prev;
        } else if (current.declaration.value.includes('var(')) {
          current.declaration.value = replaceCSSValueVariables(
            current.declaration.value,
            prev.variables,
          );
        }
        const parsed = evaluateDeclaration(current);
        Object.assign(prev.parsed, {
          [node.rawSelector]: parsed,
        });
        Object.assign(prev.styles, parsed);
        return prev;
      },
      {
        variables: {} as Record<string, string>,
        styles: {} as AnyStyle,
        parsed: {} as Record<string, AnyStyle>,
      },
    );
    return finalStyle;
  };

  const evaluateSheet = (
    rules: CssRuleAstNode[],
    result: ParserStylesResult = {
      base: {},
      even: {},
      first: {},
      group: {},
      last: {},
      odd: {},
      pointer: {},
      parsed: {},
    },
  ): ParserStylesResult => {
    for (const rule of rules) {
      if (
        rule.rawSelector.includes('web:') ||
        rule.rawSelector.includes('android:') ||
        rule.rawSelector.includes('ios:') ||
        rule.rawSelector.includes('native:')
      ) {
        if (
          (rule.rawSelector.includes('native:') && Platform.OS === 'web') ||
          !rule.rawSelector.includes(Platform.OS)
        ) {
          continue;
        }
      }
      if (rule.isGroupEvent) {
        const applied = applyRule(rule).styles;
        Object.assign(result.group, applied);
        continue;
      }
      if (rule.isPointerEvent) {
        Object.assign(result.pointer, applyRule(rule).styles);
        continue;
      }
      if (rule.rawSelector.includes('first:')) {
        Object.assign(result.first, applyRule(rule).styles);
        continue;
      }
      if (rule.rawSelector.includes('last:')) {
        Object.assign(result.last, applyRule(rule).styles);
        continue;
      }
      if (rule.rawSelector.includes('even:')) {
        Object.assign(result.even, applyRule(rule).styles);
        continue;
      }
      if (rule.rawSelector.includes('odd:')) {
        Object.assign(result.odd, applyRule(rule).styles);
        continue;
      }
      Object.assign(result.base, applyRule(rule).styles);
    }

    return result;
  };

  return (classNames) => {
    let generated = tx(classNames).split(' ');
    const result: ParserStylesResult = {
      base: {},
      even: {},
      first: {},
      group: {},
      last: {},
      odd: {},
      pointer: {},
      parsed: {},
    };
    console.group('TX');
    const parsedClassNames = parseTxClassNames(classNames);
    const createdRules: AnyStyle[] = [];
    let cssToParse = '';
    const addRuleToResult = (style: AnyStyle, variant: string[]) => {
      if (variant.includes('hover')) {
        Object.assign(result.pointer, style);
      }
    };
    parsedClassNames.forEach((injected) => {
      const cache = evaluatedRules.get(injected.n);
      if (cache) {
        createdRules.push(cache);
        addRuleToResult(cache, injected.v);
        return;
      }
      const css = tw.target.find((item) => item.includes(injected.n));
      if (css) {
        cssToParse += css;
      }
    });
    const ast = tokenizer(cssToParse);
    evaluateSheet(ast.rules);
    console.groupEnd();
    return {
      ast,
      evaluated: result,
      isGroupParent: generated.includes('group'),
    };
  };
};
// if (css) {
//   const rootNode: CssSheetAstNode = {
//     type: 'sheet',
//     rules: [],
//   };
//   console.log('STEP_CSS: ', css);
//   const ast = CssToAST(css, rootNode);
//   const runProgram = evaluateSheet(ast.rules);
//   evaluatedRules.set(injected.n, runProgram.parsed);
//   Object.assign(result.base, runProgram.base);
//   Object.assign(result.even, runProgram.even);
//   Object.assign(result.first, runProgram.first);
//   Object.assign(result.group, runProgram.group);
//   Object.assign(result.last, runProgram.last);
//   Object.assign(result.odd, runProgram.odd);
//
//   console.log('STEP_AST: ', ast);
// } else {
//   console.error(`CANT GENERATE AST FOR: ${injected.n}`);
// }
