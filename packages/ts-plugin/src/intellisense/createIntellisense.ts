import { tw as internalTW } from '@universal-labs/twind-adapter';
import { CssResolver } from '@universal-labs/css';
import {
  AutocompleteContext,
  Preset,
  TwindUserConfig,
  defineConfig,
  twind,
  virtual,
} from '@twind/core';
import { formatCss } from '../utils';
import type { CurrentTheme, VariantCompletionItem } from '../types';
import { createContextExecutor } from './intellisense.compose';
import { ConfigurationManager } from '../language-service/configuration';

export function createIntellisense() {
  const variants = new Map<string, VariantCompletionItem>();
  // const cssCache = new Map<string, string>();
  const tw = twind(
    defineConfig({
      presets: [
        defineConfig<CurrentTheme, Preset<CurrentTheme>[]>({
          ...internalTW.config,
          preflight: false,
        }) as TwindUserConfig<CurrentTheme>,
      ],
      rules: [[ConfigurationManager.VARIANT_MARKER_RULE, { '…': '…' }]],
      ignorelist: [/-\[…]$/],
    }) as TwindUserConfig<CurrentTheme>,
    virtual(false),
  );
  const context: AutocompleteContext<CurrentTheme> = {
    get theme() {
      return tw.theme;
    },
    get variants() {
      return Object.fromEntries(
        Array.from(variants.values(), (variant) => [variant.name.slice(0, -1), variant.name]),
      );
    },
  };
  let nextIndex = 0;
  const ruleExecutor = createContextExecutor(context);
  for (const rule of tw.config.rules) {
    const location = {
      index: nextIndex++,
      position: 0,
    };
    ruleExecutor.run(rule, location);
  }
  return {
    getCss,
    classes: ruleExecutor.suggestions,
    context,
  };

  function getCss(name: string) {
    const className = tw(name);
    const target = [...tw.target];
    tw.clear();
    const sheet = CssResolver(target, {
      colorScheme: 'light',
      debug: false,
      deviceHeight: 1080,
      deviceWidth: 720,
      platform: 'ios',
      rem: 16,
    });
    return {
      className,
      sheet,
      css: formatCss(target),
    };
  }
}

export type CreateIntellisenseFn = ReturnType<typeof createIntellisense>;
