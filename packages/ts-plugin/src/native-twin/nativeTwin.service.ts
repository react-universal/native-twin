import { pipe } from 'effect';
import * as ReadonlyArray from 'effect/ReadonlyArray'
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
import { createRuleClassNames, createRuleCompositions } from './nativeTwin.rules';
import {
  TwinRuleWithCompletion,
  VariantCompletionToken,
  TwinRuleCompletionWithToken,
} from './nativeTwin.types';

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
    ) => HashSet.HashSet<TwinRuleCompletionWithToken>;
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

    const twinRules: HashSet.HashSet<TwinRuleWithCompletion> = pipe(
      ReadonlyArray.fromIterable(tailwind.tw.config.rules),
      ReadonlyArray.map((x) => createRuleCompositions(x)),
      ReadonlyArray.flatten,
      ReadonlyArray.map((x) => {
        const values =
          x.parts.themeSection === 'colors'
            ? colorPalette
            : tailwind.context.theme(x.parts.themeSection as keyof __Theme__) ?? {};
        return createRuleClassNames(values, x.composition, x.parts).map(
          (className): TwinRuleWithCompletion => ({
            completion: className,
            composition: x.composition,
            rule: x.parts,
          }),
        );
      }),
      ReadonlyArray.flatten,
      ReadonlyArray.sortBy((x, y) =>
        x.completion.className > y.completion.className ? 1 : -1,
      ),
      HashSet.fromIterable,
    );

    const twinVariants = HashSet.fromIterable(variants).pipe(
      HashSet.map((variant) => {
        return {
          kind: 'variant',
          name: `${variant[0]}:`,
          value: variant[1],
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
          .filter((x) => position >= x.start && position <= x.end);
        const collected = pipe(
          twinRules,
          HashSet.flatMap((ruleInfo) => {
            return HashSet.fromIterable(positionToken).pipe(
              HashSet.filter((x) => ruleInfo.completion.className.startsWith(x.text)),
              HashSet.map(
                (token): TwinRuleCompletionWithToken => ({
                  value: ruleInfo,
                  token,
                }),
              ),
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
