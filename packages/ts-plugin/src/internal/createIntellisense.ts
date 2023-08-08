import type { Twind, TwindConfig, TwindUserConfig } from '@universal-labs/twind-native';
import { matchSorter, type MatchSorterOptions } from 'match-sorter';
import cssbeautify from 'cssbeautify';
import QuickLRU from 'quick-lru';
import type { CurrentTheme, Intellisense, IntellisenseOptions, Suggestion } from '../types';
import { spacify } from '../utils';
import { compareSuggestions } from './compareSuggestion';
import { TailwindContext } from './tailwindContext';

export function createIntellisense(
  config: Twind<CurrentTheme> | TwindConfig<CurrentTheme> | TwindUserConfig<CurrentTheme>,
  options: IntellisenseOptions = {},
): Intellisense {
  const suggestionCache = new QuickLRU<string, Suggestion[]>({
    maxSize: 1000,
    ...options.cache,
  });

  const context = new TailwindContext(config as Twind<CurrentTheme>, options);
  context.extractCompletions();

  // Precache empty input as it is the most common and take a while
  suggestionCache.set('', context.suggestions.map(toSuggestion));

  return {
    get theme() {
      return context.tailwind.tw.theme;
    },
    get config() {
      return context.tailwind.tw.config;
    },
    async suggest(input, { prefix = '', ignore } = {}) {
      const key = JSON.stringify({ input, prefix, ignore });
      let result = suggestionCache.get(key)!;

      if (!result) {
        let source = context.suggestions;
        let threshold: MatchSorterOptions['threshold'] = matchSorter.rankings.MATCHES;

        const token = prefix + input;

        const match = /^(.+(?:-\[.+])?)\/([^/]+|\[.+])?$/.exec(token);
        if (match) {
          const { 1: key, 2: modifier = '' } = match;
          const suggestion = context.classes.get(key!) || context.variants.get(key!);
          if (suggestion?.modifiers) {
            source = suggestion?.modifiers;
            input = modifier;
          }
        }

        if (token[0] === '-') {
          source = source.filter(({ name }) => name[0] === '-');

          if (prefix) {
            prefix = prefix.slice(1);
          } else {
            input = input.slice(1);
          }
        }

        if (ignore?.length) {
          source = source.filter(({ value }) => !ignore.includes(value));
        }

        if (prefix) {
          source = source
            .filter(({ type, value }) => type === 'variant' || value.startsWith(prefix))
            .map((suggestion) =>
              suggestion.type === 'variant'
                ? suggestion
                : {
                    ...suggestion,
                    filter: spacify(suggestion.value.slice(prefix.length)),
                    value: suggestion.value.slice(prefix.length),
                  },
            );
        }

        const { length } = input.replace(/[-\s]+/g, '');

        if (length === 0) {
          if (prefix) {
            source = source.sort((a, b) => compareSuggestions(a, b, prefix));
          }

          suggestionCache.set(key, (result = source.map(toSuggestion)));
        } else {
          if (length < 2) {
            threshold = matchSorter.rankings.CONTAINS;
          }
          const search = spacify(input);

          suggestionCache.set(
            key,
            (result = matchSorter(source, search, {
              keys: ['filter'],
              threshold,
              baseSort: (a, b) => compareSuggestions(a.item, b.item, prefix),
            }).map(toSuggestion)),
          );
        }
      }

      return result;
    },
  };

  function generateClassDescription(className: string): string {
    const css = context.generateCSS(className);

    const bodyStart = css.lastIndexOf('{');
    const bodyEnd = css.indexOf('}');

    if (bodyStart === -1 || bodyEnd === -1) {
      return css;
    }

    return cssbeautify(`.x{${css.slice(bodyStart + 1, bodyEnd)}}`, { indent: '' })
      .split('\n')
      .slice(1, -1)
      .join(' ');
  }

  function toSuggestion(suggestion: Suggestion): Suggestion {
    if (suggestion.type === 'variant') {
      return {
        type: suggestion.type,
        name: suggestion.name,
        value: suggestion.value,
        description: suggestion.description!,
        detail: suggestion.detail!,
        color: suggestion.color!,
      };
    }

    return {
      type: suggestion.type,
      name: suggestion.name,
      value: suggestion.value,
      description: (suggestion.description ||= generateClassDescription(suggestion.name)),
      detail: suggestion.detail!,
      color: suggestion.color!,
    };
  }
}
