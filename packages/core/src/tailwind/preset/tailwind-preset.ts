import type { Config } from 'tailwindcss';
import { boxShadow } from './box-shadow';
import { darkMode } from './dark-mode';
import { elevation } from './elevation';
import { fontSize } from './font-size';
import { gap } from './gap';
import { height } from './height';
import { lineHeight } from './line-height';
import { margin } from './margin';
import { padding } from './padding';
import { platforms } from './platforms';
import { position } from './position';
import { rotate } from './rotate';
import { rounded } from './rounded';
import { scale } from './scale';
import { skew } from './skew';
import { translate } from './translate';
import { variables } from './variables';
import { width } from './width';

interface IPresetArgs {
  baseRem?: number;
}
export function reactNativeTailwindPreset(input?: IPresetArgs) {
  const baseRem = input?.baseRem ?? 16;
  const preset: Config = {
    content: [],
    theme: {
      variables: {
        '--rem': baseRem,
      },
      extend: {
        aspectRatio: {
          auto: '0',
          square: '1',
          video: '1.777777778',
        },
        letterSpacing: {
          tighter: '-0.5px',
          tight: '-0.25px',
          normal: '0px',
          wide: '0.25px',
          wider: '0.5px',
          widest: '1px',
        },
        elevation: {
          sm: '1.5',
          DEFAULT: '3',
          md: '6',
          lg: '7.5',
          xl: '12.5',
          '2xl': '25',
          none: '0',
        },
        boxShadow: {
          sm: '0px 1px 2px rgba(0, 0, 0, 0.1)',
          DEFAULT: '0px 2px 6px rgba(0, 0, 0, 0.1)',
          md: '0px 6px 10px rgba(0, 0, 0, 0.1)',
          lg: '0px 10px 15px rgba(0, 0, 0, 0.1)',
          xl: '0px 20px 25px rgba(0, 0, 0, 0.1)',
          '2xl': '0px 25px 50px rgba(0, 0, 0, 0.1)',
          none: '0px 0px 0px rgba(0, 0, 0, 0)',
        },
      },
    },
    plugins: [
      boxShadow,
      darkMode,
      elevation,
      fontSize,
      lineHeight,
      gap,
      platforms,
      rotate,
      scale,
      platforms,
      skew,
      padding,
      translate,
      margin,
      variables,
      rounded,
      width,
      position,
      height,
    ],
    corePlugins: {
      backgroundOpacity: false,
      borderOpacity: false,
      inset: false,
      position: false,
      boxShadow: false,
      borderRadius: false,
      boxShadowColor: false,
      lineHeight: false,
      divideColor: false,
      divideOpacity: false,
      gap: false,
      divideStyle: false,
      divideWidth: false,
      fontSize: false,
      placeholderOpacity: false,
      ringOpacity: false,
      rotate: false,
      padding: false,
      margin: false,
      scale: false,
      skew: false,
      space: false,
      textOpacity: false,
      translate: false,
    },
  };

  return preset;
}
