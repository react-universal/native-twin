import type { Preset } from '@twind/core';
import { rotateRules } from '../rules/rotate';
import { shadowRules } from '../rules/shadow';
import { translateRules } from '../rules/translate';
import transformCssVariables from './css-variables';

export default function twindPresetReactNative(): Preset {
  return {
    variants: [
      ['ios', '&:ios'],
      ['android', '&:android'],
      ['web', '&:web'],
    ],
    // @ts-expect-error
    rules: [...translateRules, ...rotateRules, ...shadowRules],
    finalize(rule) {
      rule = transformCssVariables(rule);
      return rule;
    },
  };
}
