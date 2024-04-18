import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { __Theme__ } from '@native-twin/core';
import { TSPluginService } from '../plugin/ts-plugin.context';
import { getRuleInfo, RuleInfo } from './intellisense.utils';

interface CommonCompletionToken {
  name: string;
  position: number;
  index: number;
}
export interface ClassCompletionToken extends CommonCompletionToken {
  kind: 'class';
  property: string;
  themeSection: string;
  canBeNegative: boolean;
  isColor: boolean;
  themeValue: string | null;
}

export interface VariantCompletionToken extends CommonCompletionToken {
  kind: 'variant';
}

export type CompletionToken = ClassCompletionToken | VariantCompletionToken;

export interface CompletionItemLocation {
  position: number;
  index: number;
}

export class IntellisenseService extends Context.Tag('plugin/IntellisenseService')<
  IntellisenseService,
  {
    twinClasses: Map<string, ClassCompletionToken>;
    twinVariants: Map<string, VariantCompletionToken>;
    twinRules: {
      ruleInfo: RuleInfo;
      completion: {
        className: string;
        declarations: string[];
        declarationValue: string;
      };
    }[];
  }
>() {}

export const IntellisenseServiceLive = Layer.scoped(
  IntellisenseService,
  Effect.gen(function* ($) {
    const { tailwind } = yield* $(TSPluginService);
    const twinClasses = new Map<string, ClassCompletionToken>();
    const twinVariants = new Map<string, VariantCompletionToken>();
    const theme = { ...tailwind.tw.config.theme };
    const themeSections = new Set(Object.keys({ ...theme, ...theme.extend }).sort());
    themeSections.delete('theme');
    themeSections.delete('extend');
    let nextIndex = 0;
    // let position = 0;
    const currentConfig = tailwind.config;
    // const context = main.tailwind.context;

    for (const variant in {
      ...currentConfig.theme.screens,
      ...currentConfig.theme.extend?.screens,
    }) {
      const location = {
        index: nextIndex++,
        position: twinVariants.size,
      };
      twinVariants.set(variant, {
        kind: 'variant',
        name: `${variant}:`,
        ...location,
      });
    }

    const twinRules = yield* $(buildRulesInfo);
    console.log('DATA: ', twinRules, themeSections);

    return IntellisenseService.of({
      twinClasses,
      twinVariants,
      twinRules,
    });
  }),
);

const buildRulesInfo = Effect.gen(function* ($) {
  const { tailwind } = yield* $(TSPluginService);
  const tw = tailwind.tw;
  const theme = { ...tw.config.theme };
  const themeSections = new Set(Object.keys({ ...theme, ...theme.extend }).sort());
  themeSections.delete('theme');
  themeSections.delete('extend');
  const colorPalette = tailwind.context.colors;
  const combined: {
    ruleInfo: RuleInfo;
    completion: {
      className: string;
      declarations: string[];
      declarationValue: string;
    };
  }[] = [];
  for (const rule of tw.config.rules) {
    const ruleInfo = getRuleInfo(rule);
    const values =
      ruleInfo.themeSection === 'colors'
        ? colorPalette
        : tailwind.context.theme(ruleInfo.themeSection as keyof __Theme__) ?? {};
    const classNames = ruleInfo.createClassNames(values).map((x) => ({
      completion: x,
      ruleInfo,
    }));
    combined.push(...classNames);
  }

  return combined;
});
