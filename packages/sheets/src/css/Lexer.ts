import { Dimensions, Platform } from 'react-native';
import { initialize, parse } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import type { AnyStyle, Context } from './css.types';
import { cssStyleToRN } from './declarations';
import { removeCssComment, replaceDeclarationVariables } from './helpers';
import { createContext } from './parsers/mediaQueries';
import { cssDeclarationParser } from './parsers/property.parser';

const { width, height } = Dimensions.get('screen');

class Lexer {
  seenRules = new Set<string>();
  context: Context;
  tailwind = initialize();

  constructor() {
    this.tailwind = initialize();
    this.context = this.setContext({ rem: 16 });
  }

  setContext(input: { rem: number }) {
    return createContext({
      rem: input.rem,
      em: input.rem,
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
  }

  injectClassNames(classNames: string) {
    const generated = this.tailwind.tx(classNames);
    const evaluated = parse(generated);
    let baseCss = '';
    let pointerCss = '';
    let groupCss = '';
    let firstCss = '';
    let lastCss = '';
    let evenCss = '';
    let oddCss = '';
    let hasPointerEvents = false;
    let hasGroupEvents = false;
    for (const current of evaluated) {
      const found = this.tailwind.tw.target.find((item) => item.includes(current.n));
      if (!found) continue;
      let css = removeCssComment(found);
      if (current.v.includes('native') && Platform.OS === 'web') continue;
      if (current.v.includes('web') && Platform.OS !== 'web') continue;
      if (current.v.includes('ios') || current.v.includes('android')) {
        if (!current.v.includes(Platform.OS)) continue;
      }
      if (
        current.v.includes('hover') ||
        current.v.includes('active') ||
        current.v.includes('focus')
      ) {
        hasPointerEvents = true;
        pointerCss += css;
      }

      if (
        current.v.includes('group-hover') ||
        current.v.includes('group-active') ||
        current.v.includes('group-focus')
      ) {
        hasGroupEvents = true;
        groupCss += css;
      }

      if (current.v.includes('even')) {
        evenCss += css;
      }

      if (current.v.includes('odd')) {
        oddCss += css;
      }

      if (current.v.includes('first')) {
        firstCss += css;
      }

      if (current.v.includes('last')) {
        lastCss += css;
      }

      if (current.v.length === 0) {
        baseCss += css;
      }
    }
    return {
      generated: generated.split(' '),
      evaluated,
      isGroupParent: generated.split(' ').includes('group'),
      hasPointerEvents,
      hasGroupEvents,
      baseCss: () => {
        return this.parse(baseCss);
      },
      pointerCss: () => {
        return this.parse(pointerCss);
      },
      groupCss: () => {
        return this.parse(groupCss);
      },
      firstCss: () => {
        return this.parse(firstCss);
      },
      lastCss: () => {
        return this.parse(lastCss);
      },
      evenCss: () => {
        return this.parse(evenCss);
      },
      oddCss: () => {
        return this.parse(oddCss);
      },
    };
  }

  setThemeConfig(config: Config, rem = 16) {
    this.setContext({ rem });
    this.tailwind.tw.destroy();
    this.context;
    this.tailwind = initialize({
      colors: {
        ...config?.theme?.colors,
      },
      fontFamily: {
        ...config?.theme?.fontFamily,
      },
    });
  }

  parse(css: string) {
    let cursor = 0;
    const result: AnyStyle = {};

    const sliceCss = (from: number, to: number) => {
      return css.slice(from, to);
    };

    const getDeclarationsStyles = (declarations: string) => {
      const list = declarations.split(';');
      return list.reduce((prev, current) => {
        const [name, value] = current.split(':');
        if (name && value) {
          const style = cssDeclarationParser(name, value);
          Object.assign(prev, cssStyleToRN(style, this.context));
        }
        return prev;
      }, {} as AnyStyle);
    };

    const getSelector = () => {
      cursor = css.indexOf('{');
      const selector = sliceCss(0, cursor);
      css = css.slice(cursor);
      return selector;
    };

    const getDeclarations = () => {
      cursor = css.indexOf('}') + 1;
      const ruleDeclarations = sliceCss(1, cursor - 1);
      css = css.slice(cursor);
      const rawStyles = replaceDeclarationVariables(ruleDeclarations);
      return getDeclarationsStyles(rawStyles);
    };

    while (css.length > 0) {
      getSelector();
      const declarations = getDeclarations();
      Object.assign(result, declarations);
    }
    return result;
  }
}

export const lexer = new Lexer();
