import { pipe } from 'effect';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import { __Theme__ } from '@native-twin/core';
import { TSPluginService } from '../plugin/TSPlugin.service';
import {
  LocatedGroupTokenWithText,
  TemplateTokenWithText,
} from '../template/template.types';
import { RuleInfo, TwinRuleWithCompletion } from './nativeTwin.rules';
import { CompletionRuleWithToken, VariantCompletionToken } from './nativeTwin.types';

export class NativeTwinService extends Context.Tag('plugin/IntellisenseService')<
  NativeTwinService,
  {
    store: {
      twinVariants: HashSet.HashSet<VariantCompletionToken>;
      twinRules: HashSet.HashSet<TwinRuleWithCompletion>;
    };
    findRuleCompletions: (
      rule: TemplateTokenWithText[],
      position: number,
    ) => HashSet.HashSet<CompletionRuleWithToken>;
  }
>() {}

export const NativeTwinServiceLive = Layer.scoped(
  NativeTwinService,
  Effect.gen(function* ($) {
    const { tailwind } = yield* $(TSPluginService);
    const theme = { ...tailwind.tw.config.theme };
    const themeSections = new Set(Object.keys({ ...theme, ...theme.extend }).sort());
    themeSections.delete('theme');
    themeSections.delete('extend');
    let nextIndex = 0;
    // let position = 0;
    const currentConfig = tailwind.config;
    const variants = Object.entries({
      ...currentConfig.theme.screens,
      ...currentConfig.theme.extend?.screens,
    });
    const colorPalette = tailwind.context.colors;
    // const context = main.tailwind.context;

    const twinRules = HashSet.fromIterable(tailwind.tw.config.rules).pipe(
      HashSet.flatMap((rule): HashSet.HashSet<TwinRuleWithCompletion> => {
        const ruleInfo = new RuleInfo(rule);
        const values =
          ruleInfo.themeSection === 'colors'
            ? colorPalette
            : tailwind.context.theme(ruleInfo.themeSection as keyof __Theme__) ?? {};
        return HashSet.fromIterable(
          ruleInfo
            .createClassNames(values)
            .map((x) => new TwinRuleWithCompletion(ruleInfo, x)),
        );
      }),
    );

    const twinVariants = HashSet.fromIterable(variants).pipe(
      HashSet.map((variant) => {
        return {
          kind: 'variant',
          name: `${variant}:`,
          index: nextIndex++,
          position: nextIndex,
        } as const;
      }),
    );

    return NativeTwinService.of({
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
        const collected = pipe(
          twinRules,
          HashSet.flatMap((ruleInfo) => {
            return HashSet.fromIterable(positionToken).pipe(
              HashSet.filter((x) => ruleInfo.completion.className.startsWith(x.text)),
              HashSet.map((token) => ({
                ruleInfo,
                token,
              })),
            );
          }),
        );
        return collected;
      },
    });
  }),
);

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
