import { Dimensions, Platform } from 'react-native';
import { initialize, parse as parseTxClassNames } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import type { AnyStyle, CssDeclarationAstNode, CssRuleAstNode } from './css.types';
import { cssStyleToRN } from './declarations';
import { replaceCSSValueVariables } from './helpers';
import { createContext } from './parsers/mediaQueries';
import { cssDeclarationParser } from './parsers/property.parser';
import { tokenizer } from './tokenizer';

const { width, height } = Dimensions.get('screen');

interface CssParser {
  (config?: Config, rem?: number): (...args: string[]) => {
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
}

const evaluatedRules = new Map<string, AnyStyle>();

export const cssParser: CssParser = (config, rem = 16) => {
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
        Object.assign(prev.styles, parsed);
        return prev;
      },
      {
        variables: {} as Record<string, string>,
        styles: {} as AnyStyle,
      },
    );
    return finalStyle;
  };

  const evaluateSheet = (
    rules: CssRuleAstNode[],
    result: [CssRuleAstNode, AnyStyle][] = [],
  ): [CssRuleAstNode, AnyStyle][] => {
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
        result.push([rule, applied]);
        continue;
      }
      if (rule.isPointerEvent) {
        result.push([rule, applyRule(rule).styles]);
        continue;
      }
      if (rule.rawSelector.includes('first:')) {
        result.push([rule, applyRule(rule).styles]);
        continue;
      }
      if (rule.rawSelector.includes('last:')) {
        result.push([rule, applyRule(rule).styles]);
        continue;
      }
      if (rule.rawSelector.includes('even:')) {
        result.push([rule, applyRule(rule).styles]);
        continue;
      }
      if (rule.rawSelector.includes('odd:')) {
        result.push([rule, applyRule(rule).styles]);
        continue;
      }
      result.push([rule, applyRule(rule).styles]);
    }

    return result;
  };

  return (classNames) => {
    const generated = tx(classNames).split(' ');
    const result: ParserStylesResult = {
      base: {},
      even: {},
      first: {},
      group: {},
      last: {},
      odd: {},
      pointer: {},
    };
    const parsedClassNames = parseTxClassNames(classNames);
    const createdRules: AnyStyle[] = [];
    let cssToParse = '';
    const addRuleToResult = (style: AnyStyle, variant: string[]) => {
      if (
        variant.includes('group-hover') ||
        variant.includes('group-focus') ||
        variant.includes('group-active')
      ) {
        Object.assign(result.group, style);
        return;
      }
      if (
        variant.includes('hover') ||
        variant.includes('focus') ||
        variant.includes('active')
      ) {
        Object.assign(result.pointer, style);
        return;
      }
      if (variant.includes('first')) {
        Object.assign(result.first, style);
        return;
      }
      if (variant.includes('last')) {
        Object.assign(result.last, style);
        return;
      }
      if (variant.includes('even')) {
        Object.assign(result.even, style);
        return;
      }
      if (variant.includes('odd')) {
        Object.assign(result.odd, style);
        return;
      }
      Object.assign(result.base, style);
    };
    parsedClassNames.forEach((injected) => {
      if (
        injected.v.includes('web') ||
        injected.v.includes('android') ||
        injected.v.includes('ios') ||
        injected.v.includes('native')
      ) {
        if (!injected.v.includes(Platform.OS)) {
          return;
        }
      }
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
    let ast = tokenizer(cssToParse);
    const evaluated = evaluateSheet(ast.rules);
    for (const [ruleNode, style] of evaluated) {
      const injected = parsedClassNames.find(
        (meta) => ruleNode.selector.includes(meta.n) || ruleNode.rawSelector.includes(meta.n),
      );
      if (injected) {
        addRuleToResult(style, injected.v);
        evaluatedRules.set(injected.n, style);
      } else {
        // eslint-disable-next-line no-console
        console.warn(`CANT ADD EVALUATED FOR: ${ruleNode.rawRule}`);
      }
    }
    // @ts-expect-error
    ast = undefined;
    return {
      evaluated: result,
      isGroupParent: generated.includes('group'),
    };
  };
};
