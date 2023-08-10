import type { BaseTheme, Preset } from '@twind/core';
import type { TailwindTheme } from './types';
import theme from './baseTheme';
import preflight from './preflight';
import rules from './rules';
import variants from './variants';
export * from './types';

export interface TailwindPresetBaseOptions {
  colors?: BaseTheme['colors'];
  /** Allows to disable to tailwind preflight (default: `false` eg include the tailwind preflight ) */
  disablePreflight?: boolean | undefined;
}

/**
 * @experimental
 */
export default function presetTailwindBase({
  colors,
  disablePreflight,
}: TailwindPresetBaseOptions = {}): Preset<BaseTheme & TailwindTheme> {
  return {
    // allow other preflight to run
    preflight: disablePreflight ? undefined : preflight,
    theme: {
      ...theme,
      colors: {
        inherit: 'inherit',
        current: 'currentColor',
        transparent: 'transparent',
        black: '#000',
        white: '#fff',
        ...colors,
      },
    },
    variants,
    rules,
    finalize(rule) {
      // automatically add `content: ''` to before and after so you don’t have to specify it unless you want a different value
      if (
        // ignore global, preflight, and auto added rules
        rule.n &&
        // only if there are declarations
        rule.d &&
        // and it has a ::before or ::after selector
        rule.r.some((r) => /^&::(before|after)$/.test(r)) &&
        // there is no content property yet
        !/(^|;)content:/.test(rule.d)
      ) {
        return { ...rule, d: 'content:var(--tw-content);' + rule.d };
      }

      return rule;
    },
  };
}
