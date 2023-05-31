import { Dimensions } from 'react-native';
import { initialize } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import { cssToAst } from './ast';
import { createContext } from './parsers/mediaQueries';

type SetThemeConfigFn = (input: Config, rem?: number) => void;
const { height, width } = Dimensions.get('screen');

const createTailwindInterpreter = () => {
  let processor = initialize();
  let context = createContext({
    rem: 16,
    em: 16,
    cm: 37.8,
    mm: 3.78,
    in: 96,
    pt: 1.33,
    pc: 16,
    px: 1,
    height: height,
    width: width,
    vmin: width < height ? width : height,
    vmax: width > height ? width : height,
    vw: width,
    vh: height,
    '%': 0,
  });

  const setThemeConfig: SetThemeConfigFn = (config: Config, rem = 16) => {
    context = createContext({
      rem,
      em: rem,
      cm: 37.8,
      mm: 3.78,
      in: 96,
      pt: 1.33,
      pc: 16,
      px: 1,
      height: height,
      width: width,
      vmin: width < height ? width : height,
      vmax: width > height ? width : height,
      vw: width,
      vh: height,
      '%': 0,
    });
    processor.tw.destroy();
    processor = initialize({
      colors: {
        ...config?.theme?.colors,
      },
      fontFamily: {
        ...config?.theme?.fontFamily,
      },
    });
  };

  const classNamesToCss = (classNames: string) => {
    const restore = processor.tw.snapshot();
    const generateClassNames = processor.tx(classNames).split(' ');
    const ast = cssToAst(processor.tw.target, context);
    restore();

    return {
      ast,
      isGroupParent: generateClassNames.includes('group'),
    };
  };

  return {
    classNamesToCss,
    setThemeConfig,
  };
};

export const lexer = createTailwindInterpreter();
