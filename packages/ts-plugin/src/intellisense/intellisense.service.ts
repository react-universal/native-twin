import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import { __Theme__ } from '@native-twin/core';
import { TSPluginService } from '../plugin/ts-plugin.context';
import {
  LocatedGroupTokenWithText,
  TemplateTokenWithText,
} from '../template/template.types';
import { TwinRule, VariantCompletionToken } from './intellisense.types';
import { RuleInfo } from './intellisense.utils';

export class IntellisenseService extends Context.Tag('plugin/IntellisenseService')<
  IntellisenseService,
  {
    store: {
      twinVariants: Map<string, VariantCompletionToken>;
      twinRules: Map<string, TwinRule>;
    };
    findRuleCompletions: (
      rule: TemplateTokenWithText[],
      position: number,
    ) => (TwinRule & { token: TemplateTokenWithText })[];
  }
>() {}

export const IntellisenseServiceLive = Layer.scoped(
  IntellisenseService,
  Effect.gen(function* ($) {
    const { tailwind } = yield* $(TSPluginService);
    const twinVariants = new Map<string, VariantCompletionToken>();
    const theme = { ...tailwind.tw.config.theme };
    const themeSections = new Set(Object.keys({ ...theme, ...theme.extend }).sort());
    themeSections.delete('theme');
    themeSections.delete('extend');
    let nextIndex = 0;
    // let position = 0;
    const currentConfig = tailwind.config;
    // const context = main.tailwind.context;

    yield* $(
      Effect.sync(() => {
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
      }),
    );

    const twinRules = yield* $(
      buildRulesInfo,
      Effect.map((x) => x.map((y) => [y.completion.className, y] as const)),
      Effect.map((x) => new Map(x)),
    );

    return IntellisenseService.of({
      store: {
        twinVariants,
        twinRules,
      },
      findRuleCompletions: (tokens, position) => {
        const positionToken = tokens
          .map((x) => getCompletionParts(x))
          .flat()
          .filter((x) => {
            return position >= x.start && position <= x.end;
          });
        const collected = ReadonlyArray.map(positionToken, (token) => {
          const completionByToken = Array.from(twinRules.values()).filter((x) =>
            x.completion.className.startsWith(token.text),
          );
          return completionByToken.map((x) => ({ ...x, token }));
        }).flat();

        return collected;
      },
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
    const ruleInfo = new RuleInfo(rule);
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

const getCompletionParts = (
  token: TemplateTokenWithText,
): Exclude<TemplateTokenWithText, LocatedGroupTokenWithText>[] => {
  if (token.type === 'CLASS_NAME') {
    return [token];
  }

  if (token.type === 'ARBITRARY') {
    return [token];
  }
  if (token.type === 'VARIANT') {
    return [token];
  }
  if (token.type === 'VARIANT_CLASS') {
    return [token];
  }
  if (token.type === 'GROUP') {
    const classNames = token.value.content.flatMap((x) => {
      return getCompletionParts(x);
    });
    return classNames;
  }

  return [];
};
