import { Dimensions, PixelRatio, Platform } from 'react-native';
import { CssResolver } from '@universal-labs/css';
import { initialize } from '@universal-labs/twind-adapter';
import type { Config } from 'tailwindcss';
import type { Context, Units } from './css.types';

type SetThemeConfigFn = (input: Config, rem?: number) => void;
const { height, width } = Dimensions.get('screen');

function createContext(units: Pick<Units, 'rem' | 'vh' | 'vw'>): Context {
  const vw = units.vw ?? 1;
  const vh = units.vh ?? 1;
  return {
    deviceAspectRatio: vw / vh,
    deviceHeight: vh,
    deviceWidth: vw,
    orientation: vw > vh ? 'landscape' : 'portrait',
    prefersReducedMotion: 'no-preference',
    resolution: PixelRatio.getPixelSizeForLayoutSize(vw),
    units: {
      rem: units.rem,
      em: units.rem,
      cm: 37.8,
      mm: 3.78,
      in: 96,
      pt: 1.33,
      pc: 16,
      px: 1,
      vmin: vw < vh ? vw : vh,
      vmax: vw > vh ? vw : vh,
      vw,
      vh,
    },
  };
}

const platformMatch = /web|ios|android|native+/;

const evaluateTwUtilities = (target: string[], context: Context) => {
  const purged = target.filter((item) =>
    platformMatch.test(item) ? item.includes(Platform.OS) : true,
  );
  return CssResolver(purged, {
    deviceHeight: context.deviceHeight,
    deviceWidth: context.deviceHeight,
    rem: context.units.rem,
    platform: Platform.OS,
  });
};

const createTwindInterpreter = () => {
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

export { createTwindInterpreter };
