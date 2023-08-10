import {
  asArray,
  type AutocompleteContext,
  type Twind,
  type TwindConfig,
  type TwindUserConfig,
  AutocompleteItem,
  stringify,
} from '@twind/core';
import type { IntellisenseClass, IntellisenseContext, IntellisenseVariant } from '../types';
import { CurrentTheme, IntellisenseOptions } from '../types';
import QuickLRU from 'quick-lru';
import { spacify, toCondition } from '../utils';
import { parseColor } from './color';
import {
  extractMediaQueries,
  extractPseudoClasses,
  extractRulesFromTheme,
  extractVariants,
} from './extractors';
import { compareSuggestions } from './compareSuggestion';
import { tw } from '@universal-labs/twind-adapter';

export class TailwindContext {
  config: Twind<CurrentTheme> | TwindConfig<CurrentTheme> | TwindUserConfig<CurrentTheme>;
  cache: QuickLRU<string, string>;
  tailwind: { tw: typeof tw };
  ignoreList: (string | RegExp)[];
  variants: IntellisenseContext['variants'];
  classes: IntellisenseContext['classes'];
  suggestions: IntellisenseContext['suggestions'];
  deferreds: (() => void)[] = [];
  nextIndex = 0;
  constructor(
    config: Twind<CurrentTheme> | TwindConfig<CurrentTheme> | TwindUserConfig<CurrentTheme>,
    options: IntellisenseOptions = {},
  ) {
    this.config = config;
    this.cache = new QuickLRU<string, string>({ maxSize: 1000, ...options.cache });
    this.tailwind = { tw };
    this.ignoreList = asArray(this.tailwind.tw.config.ignorelist).map(toCondition);
    this.variants = new Map();
    this.classes = new Map();
    this.suggestions = [];
  }

  get context() {
    const theme = this.tailwind.tw.theme;
    const variants = this.variants;
    const context: AutocompleteContext<CurrentTheme> = {
      get theme() {
        return theme;
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
    return context;
  }

  extractCompletions() {
    extractMediaQueries(
      {
        screens: this.tailwind.tw.theme('screens'),
      },
      (completion) => {
        this.addSuggestion(this.variants, {
          index: this.nextIndex++,
          name: completion,
          position: this.classes.size,
          source: completion,
          type: 'variant',
        });
      },
    );
    extractVariants(
      {
        context: this.context,
        deferreds: this.deferreds,
        variants: this.tailwind.tw.config.variants,
      },
      (completion) => {
        if (typeof completion == 'string') {
          this.addSuggestion(this.variants, {
            index: this.nextIndex++,
            name: completion,
            position: this.classes.size,
            source: completion,
            type: 'variant',
          });
        } else {
          this.addSuggestion(this.variants, {
            index: this.nextIndex++,
            name: completion.label!,
            position: this.classes.size,
            source: completion.label!,
            type: 'variant',
          });
        }
      },
    );
    extractPseudoClasses((variant) => {
      this.addSuggestion(this.variants, {
        index: this.nextIndex++,
        name: variant,
        position: this.classes.size,
        source: 'built-in',
        type: 'variant',
      });
    });
    if (this.deferreds.length) {
      for (const deferred of this.deferreds) {
        deferred();
      }
    }
    extractRulesFromTheme(
      {
        context: this.context,
        rules: this.tailwind.tw.config.rules,
      },
      (completion) => {
        if (typeof completion == 'string') {
          this.addSuggestion(this.classes, {
            index: this.nextIndex++,
            name: completion,
            position: this.classes.size,
            source: completion,
            type: 'class',
          });
        } else {
          this.addSuggestion(this.classes, {
            index: this.nextIndex++,
            name: completion.label!,
            position: this.classes.size,
            source: completion.label!,
            type: 'class',
          });
        }
      },
    );
    this.suggestions.sort(compareSuggestions);
  }

  isIgnored(className: string) {
    return this.ignoreList.some((re) => {
      return typeof re === 'string' ? re === className : re.test(className);
    });
  }

  generateCSS(token: string) {
    let result = this.cache.get(token)!;

    if (!result) {
      this.tailwind.tw.clear();

      const isVariant = this.variants.has(token);

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

      this.tailwind.tw(name);

      const css = stringify(this.tailwind.tw.target);

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

      this.cache.set(token, result);
    }

    return result;
  }

  addSuggestion<T extends IntellisenseClass | IntellisenseVariant>(
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
    if (completion.type === 'class' && this.isIgnored(completion.name)) return;

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
      this.suggestions.push(completion as unknown as T);

      if (modifiers && modifiers.length) {
        this.suggestions.push({
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
            if (completion.type === 'class' && this.isIgnored(completion.name)) {
              return false;
            }

            target.set(suggestion.name, suggestion as T);

            return true;
          });
      }
    }
  }
}
