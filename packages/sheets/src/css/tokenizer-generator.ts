import { Dimensions } from 'react-native';
import { initialize, parse } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import type { AnyStyle } from './css.types';
import { cssStyleToRN } from './declarations';
import { removeCssComment, replaceDeclarationVariables } from './helpers';
import { createContext } from './parsers/mediaQueries';
import { cssDeclarationParser } from './parsers/property.parser';

const { width, height } = Dimensions.get('screen');

function createLexer /* #__PURE__ */(rem = 16) {
  let css = '';
  let parser = initialize();
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
  return {
    injectCss(newCss: string) {
      css += removeCssComment(newCss);
    },
    injectClassNames(classNames: string) {
      const generated = parser.tx(classNames);
      const evaluated = parse(generated);
      for (const current of evaluated) {
        const found = parser.tw.target.find((item) => item.includes(current.n));
        if (found) {
          css += found;
        }
      }
      parser.tw.clear();
      return {
        generated: generated.split(' '),
        evaluated,
      };
    },
    setThemeConfig(config: Config) {
      parser.tw.destroy();
      parser = initialize({
        colors: {
          ...config?.theme?.colors,
        },
        fontFamily: {
          ...config?.theme?.fontFamily,
        },
      });
    },
    parse: function* () {
      let cursor = 0;

      const sliceCss = (from: number, to: number) => {
        return css.slice(from, to);
      };

      const getDeclarationsStyles = (declarations: string) => {
        const list = declarations.split(';');
        return list.reduce((prev, current) => {
          const [name, value] = current.split(':');
          if (name && value) {
            const style = cssDeclarationParser(name, value);
            Object.assign(prev, cssStyleToRN(style, context));
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

      while (true) {
        if (css.length === 0) {
          cursor = 0;
          return;
        }
        const selector = getSelector();
        const declarations = getDeclarations();
        yield {
          selector,
          declarations,
        };
      }
    },
  };
}

export const CssLexer = createLexer();
