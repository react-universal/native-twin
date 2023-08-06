/* eslint-disable no-console */

import {
  asArray,
  type AutocompleteContext,
  type AutocompleteItem,
  stringify,
  type Twind,
  type TwindConfig,
  type TwindUserConfig,
} from '@universal-labs/twind-adapter';
import { toCondition, spacify } from '../utils';
import type { CurrentTheme, IntellisenseOptions } from '../types';
import type { IntellisenseContext, IntellisenseClass, IntellisenseVariant } from './types';
import { parseColor } from './color';
import { compareSuggestions } from './compareSuggestion';
import QuickLRU from 'quick-lru';
import { Tailwind } from '@universal-labs/twind-adapter';
import { extractRulesFromTheme } from '../extractors/extractRules';
import { extractPseudoClasses } from '../extractors/extractPseudo';
import { extractVariants } from '../extractors/extractVariants';
import { extractMediaQueries } from '../extractors/extractMediaQueries';

export function createIntellisenseContext(
  config: Twind<CurrentTheme> | TwindConfig<CurrentTheme> | TwindUserConfig<CurrentTheme>,
  options: IntellisenseOptions = {},
): IntellisenseContext {
  const {
    instance: { tw },
  } = new Tailwind();
  // console.log('END: ', tw.config.rules);

  const ignoreList = asArray(tw.config.ignorelist).map(toCondition);
  const variants: IntellisenseContext['variants'] = new Map();
  const classes: IntellisenseContext['classes'] = new Map();
  const suggestions: IntellisenseContext['suggestions'] = [];

  const cssCache = new QuickLRU<string, string>({ maxSize: 1000, ...options.cache });

  const deferreds: (() => void)[] = [];

  const context: AutocompleteContext<CurrentTheme> = {
    get theme() {
      return tw.theme;
    },
    get variants() {
      return Object.fromEntries(
        Array.from(variants.values(), (variant) => [
          variant.name.slice(0, -1),
          variant.description || variant.name,
        ]),
      );
    },
  };

  let nextIndex = 0;

  extractMediaQueries(
    {
      screens: tw.theme('screens'),
    },
    (completion) => {
      addSuggestion(variants, {
        index: nextIndex++,
        name: completion,
        position: classes.size,
        source: completion,
        type: 'variant',
      });
    },
  );
  extractVariants(
    {
      context,
      deferreds,
      variants: tw.config.variants,
    },
    (completion) => {
      if (typeof completion == 'string') {
        addSuggestion(variants, {
          index: nextIndex++,
          name: completion,
          position: classes.size,
          source: completion,
          type: 'variant',
        });
      } else {
        addSuggestion(variants, {
          index: nextIndex++,
          name: completion.label!,
          position: classes.size,
          source: completion.label!,
          type: 'variant',
        });
      }
    },
  );
  extractPseudoClasses((variant) => {
    addSuggestion(variants, {
      index: nextIndex++,
      name: variant,
      position: classes.size,
      source: 'built-in',
      type: 'variant',
    });
  });
  if (deferreds.length) {
    for (const deferred of deferreds) {
      deferred();
    }
  }
  extractRulesFromTheme(
    {
      context,
      rules: tw.config.rules,
    },
    (completion) => {
      if (typeof completion == 'string') {
        addSuggestion(classes, {
          index: nextIndex++,
          name: completion,
          position: classes.size,
          source: completion,
          type: 'class',
        });
      } else {
        addSuggestion(classes, {
          index: nextIndex++,
          name: completion.label!,
          position: classes.size,
          source: completion.label!,
          type: 'class',
        });
      }
    },
  );

  suggestions.sort(compareSuggestions);

  return {
    tw,
    variants,
    classes,
    suggestions,
    isIgnored,
    generateCSS: (token) => {
      let result = cssCache.get(token);

      if (!result) {
        tw.clear();

        const isVariant = variants.has(token);

        let name =
          isVariant && token.endsWith('[:')
            ? `${token.slice(0, -1)}…]:`
            : token.endsWith('[')
            ? `${token}…]`
            : isVariant && token.endsWith('/:')
            ? `${token.slice(0, -1)}…:`
            : token.endsWith('/')
            ? `${token}…`
            : token;

        if (isVariant) {
          if (!name.endsWith(':')) {
            name += ':';
          }

          name += '…';
        }

        tw(name);

        const css = stringify(tw.target);

        const needle = `,${name}*/`;
        const startIndex = css.indexOf(needle);

        if (startIndex === -1) {
          result = css;
        } else {
          const nextDeclarationStart = css.indexOf('/*', startIndex);

          result = css.slice(
            startIndex + needle.length,
            nextDeclarationStart !== -1 ? nextDeclarationStart : css.length,
          );
        }

        if (isVariant) {
          result = result.replace(/…:…;?/, '');
        }

        cssCache.set(token, result);
      }

      return result;
    },
  };

  function isIgnored(className: string) {
    return ignoreList.some((re) => re.test(className));
  }

  function addSuggestion<T extends IntellisenseClass | IntellisenseVariant>(
    target: Map<string, T>,
    {
      modifiers,
      ...completion
    }: Omit<T, 'filter' | 'value' | 'description' | 'modifiers'> & {
      filter?: string;
      value?: string;
      description?: string;
      modifiers?: AutocompleteItem['modifiers'];
    },
  ) {
    if (completion.type === 'class' && isIgnored(completion.name)) return;

    if (
      target.has(completion.name) &&
      JSON.stringify(target.get(completion.name), ['type', 'name']) !==
        JSON.stringify(completion, ['type', 'name'])
    ) {
      console.warn(`Duplicate ${completion.type}: ${JSON.stringify(completion.name)}`);
    } else {
      completion.value ||= completion.name;
      completion.filter ||= spacify(completion.value);
      completion.description ||= '';

      target.set(completion.name, completion as unknown as T);
      suggestions.push(completion as unknown as T);

      if (modifiers && modifiers.length) {
        suggestions.push({
          ...(completion as unknown as T),
          name: completion.name + '/',
          value: completion.value + '/',
          filter: spacify(completion.value + '/'),
          description: '',
        });
        (completion as any).modifiers = modifiers
          .map(({ modifier, theme, color, label }, position) => ({
            ...(completion as unknown as Omit<T, 'modifiers'>),
            position,
            name: `${completion.name}/${modifier}`,
            value: `${completion.value}/${modifier}`,
            filter: spacify(modifier),
            description: label || '',
            theme,
            color: color && parseColor(color) ? color : undefined,
          }))
          .filter((suggestion) => {
            if (completion.type === 'class' && isIgnored(completion.name)) {
              return false;
            }

            target.set(suggestion.name, suggestion as T);

            return true;
          });
      }
    }
  }
}
