import type { BaseTheme, Preset, TailwindTheme } from '@universal-labs/twind-native';
import { rotateRules } from '../rules/rotate';
import { shadowRules } from '../rules/shadow';
import { translateRules } from '../rules/translate';
import transformCssVariables from './css-variables';

export default function twindPresetReactNative(): Preset<BaseTheme & TailwindTheme> {
  return {
    variants: [
      ['ios', '&:ios'],
      ['android', '&:android'],
      ['web', '&:web'],
    ],
    rules: [...translateRules, ...rotateRules, ...shadowRules],
    finalize(rule) {
      rule = transformCssVariables(rule);
      return rule;
    },
  };
}
