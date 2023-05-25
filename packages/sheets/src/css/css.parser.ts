import { Dimensions } from 'react-native';
import { initialize } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import type { AnyStyle } from '../types';
import type { RuleNode } from './css.types';
import { getCssForSelectors, getRulesForStyleType } from './helpers';
import { CssToAST } from './lexer';
import { createContext } from './parsers/mediaQueries';

const { width, height } = Dimensions.get('screen');

interface ParserStylesResult {
  base: AnyStyle;
  pointer: AnyStyle;
  group: AnyStyle;
  even: AnyStyle;
  odd: AnyStyle;
  first: AnyStyle;
  last: AnyStyle;
  isGroupParent: boolean;
}

interface CssParser {
  (config?: Config, rem?: number): (...args: string[]) => ParserStylesResult;
}

/*
  CSS ABSOLUTE UNITS
  https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units
  mm: 3.78px
  cm: 37.8px
  in: 96px
  pt: 1.33px
  pc: 16px
  px: 1px
*/
/*
  CSS RELATIVE UNITS
  https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units
  em: 16px -> :root base
  rem: 16px -> :root base
  ex: NOT_IMPLEMENTED -> not supported -> fallback to px
  ch: NOT_IMPLEMENTED -> not supported -> fallback to px
  vw: SCREEN DIMENSIONS WIDTH -> viewport width TODO: implement size change listener
  vh: SCREEN DIMENSIONS HEIGHT -> viewport height TODO: implement size change listener
  vmin: SCREEN DIMENSIONS MIN -> viewport min between width and height TODO: implement size change listener
  vmax: SCREEN DIMENSIONS MAX -> viewport max between width and height TODO: implement size change listener
  %: RELATIVE TO PARENT ELEMENT
*/
export const cssParser: CssParser = (config, rem = 16) => {
  const rules: RuleNode[] = [];
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

  const evaluate = (classNames: string) => {
    const generated = tx(classNames).split(' ');
    const css = getCssForSelectors(tw.target, generated);
    const ast = CssToAST(css);
    rules.push(...ast);
    return {
      ast,
      generated,
    };
  };

  return (classNames) => {
    const { generated } = evaluate(classNames);

    return {
      base: getRulesForStyleType('base', rules, generated, context),
      even: getRulesForStyleType('even', rules, generated, context),
      first: getRulesForStyleType('first', rules, generated, context),
      group: getRulesForStyleType('group', rules, generated, context),
      last: getRulesForStyleType('last', rules, generated, context),
      odd: getRulesForStyleType('odd', rules, generated, context),
      pointer: getRulesForStyleType('pointer', rules, generated, context),
      isGroupParent: generated.includes('group'),
    };
  };
};
