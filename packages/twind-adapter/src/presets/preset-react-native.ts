import type { Preset } from '@twind/core';
import { rotateRules } from '../rules/rotate';
import { shadowRules } from '../rules/shadow';
import { translateRules } from '../rules/translate';
import convertCalc from './calc';
import transformCssVariables from './css-variables';

export default function twindPresetReactNative(): Preset {
  return {
    variants: [
      ['ios', '&:ios'],
      ['android', '&:android'],
      ['web', ':web'],
    ],
    // @ts-expect-error
    rules: [...translateRules, ...rotateRules, ...shadowRules],
    finalize(rule) {
      // rule = flexToReactNative(rule);
      // rule = remToPx(rule, { baseRem });
      rule = convertCalc(rule);
      rule = transformCssVariables(rule);
      return rule;
    },
  };
}
