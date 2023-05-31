import type { Preset } from '@twind/core';
import { rotateRules } from '../rules/rotate';
import { translateRules } from '../rules/translate';
import convertCalc from './calc';
import transformCssVariables from './css-variables';
import remToPx from './rem-to-px';

export default function twindPresetReactNative({ baseRem = 16 }): Preset {
  return {
    variants: [
      ['ios', '&:ios'],
      ['android', '&:android'],
      ['web', ':web'],
    ],
    // @ts-expect-error
    rules: [...translateRules, ...rotateRules],
    finalize(rule) {
      // rule = flexToReactNative(rule);
      rule = remToPx(rule, { baseRem });
      rule = convertCalc(rule);
      rule = transformCssVariables(rule);
      return rule;
    },
  };
}
