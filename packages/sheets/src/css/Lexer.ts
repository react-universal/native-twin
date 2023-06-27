import { Dimensions } from 'react-native';
import { initialize } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import { createContext } from './parsers/mediaQueries';
import { evaluateTwUtilities } from './tokenizer';

type SetThemeConfigFn = (input: Config, rem?: number) => void;
const { height, width } = Dimensions.get('screen');

const createTailwindInterpreter = () => {
  let processor = initialize();
  let context = createContext({
    rem: 16,
    vh: height,
    vw: width,
  });

  const setThemeConfig: SetThemeConfigFn = (config: Config, rem = 16) => {
    context = createContext({
      rem,
      vh: height,
      vw: width,
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
    const ast = evaluateTwUtilities(processor.tw.target, context);
    restore();

    return {
      ast,
      isGroupParent: generateClassNames.includes('group'),
    };
  };

  return {
    classNamesToCss,
    setThemeConfig,
    context,
  };
};

export const lexer = createTailwindInterpreter();
