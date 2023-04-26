import type { Preset } from '@twind/core';
import { translateRules } from '../rules/translate';
import convertCalc from './calc';
import transformCssVariables from './css-variables';
import flexToReactNative from './flex';
import remToPx from './rem-to-px';

export default function twindPresetReactNative({ baseRem = 16 }): Preset {
  return {
    variants: [['ios', '&:ios']],
    theme: {
      extend: {
        colors: {
          primary: 'blue',
        },
        screens: {
          ios: ':ios',
          android: ':android',
          web: ':web',
        },
        // @ts-expect-error
        fontFamily: {
          DEFAULT: 'Inter-Regular',
          inter: 'Inter-Regular',
          'inter-bold': 'Inter-Bold',
          'inter-medium': 'Inter-Medium',
          sans: 'Inter-Regular',
        },
      },
    },
    // @ts-expect-error
    rules: [...translateRules],
    finalize(rule) {
      rule = flexToReactNative(rule);
      rule = remToPx(rule, { baseRem });
      rule = convertCalc(rule);
      rule = transformCssVariables(rule);
      return rule;
    },
  };
}
