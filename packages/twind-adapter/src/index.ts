import {
  twind,
  virtual,
  tx as tx$,
  cx as cx$,
  injectGlobal as injectGlobal$,
  keyframes as keyframes$,
  defineConfig,
} from '@twind/core';
import { rotateRules } from './rules/rotate';
import { shadowRules } from './rules/shadow';
import { skewRules } from './rules/skew';
import { translateRules } from './rules/translate';
import { presetTailwind } from './tailwind-theme';
import transformCssVariables from './presets/css-variables';
import { CustomConfig } from './types';
export type * from './types';
export * from './tailwind-theme';

const defaultConfig = defineConfig({
  darkMode: 'class',
  ignorelist: [
    'grid-(.*)',
    'col-(.*)',
    'row-(.*)',
    'auto-cols-(.*)',
    'auto-rows-(.*)',
    'transition-(.*)',
    'duration-(.*)',
    'ease-(.*)',
    'delay-(.*)',
    'animate-(.*)',
  ],
  variants: [
    ['ios', '&:ios'],
    ['android', '&:android'],
    ['web', '&:web'],
  ],
  rules: [...translateRules, ...rotateRules, ...shadowRules, ...skewRules],
  finalize(rule) {
    rule = transformCssVariables(rule);
    return rule;
  },
  presets: [presetTailwind({ disablePreflight: true })],
});

export let tw = /* #__PURE__ */ twind(defaultConfig, virtual(false));
export let tx = /* #__PURE__ */ tx$.bind(tw);
export let injectGlobal = /* #__PURE__ */ injectGlobal$.bind(tw);
export let keyframes = /* #__PURE__ */ keyframes$.bind(tw);
export let cx = /* #__PURE__ */ cx$.bind(tw);

export class Tailwind {
  constructor(userTheme: Exclude<CustomConfig['theme'], undefined> = {}) {
    tw.clear();
    tw.destroy();
    // @ts-expect-error
    tw = undefined;
    tw = twind(
      {
        ...defaultConfig,
        theme: {
          ...defaultConfig.theme,
          extend: {
            ...defaultConfig.theme,
            ...userTheme,
          },
        },
      },
      virtual(false),
    );
    tx = tx$.bind(tw);
    cx = cx$.bind(tw);
  }

  parseAndInject(classNames: string) {
    const restore = tw.snapshot();
    const generated = tx`${classNames}`;
    const target = [...tw.target];
    restore();
    return {
      generated,
      target,
    };
  }
}

export type * from './types';
