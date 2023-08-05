import genex from 'genex';
import { VARIANT_MARKER_RULE } from '../../constants/config.constants';
import { CurrentTheme } from '../types';
import {
  AutocompleteContext,
  AutocompleteItem,
  MatchResult,
  Rule,
  asArray,
  getAutocompleteProvider,
} from '@universal-labs/twind-adapter';
import { toCondition } from '../utils';
import {
  autocompleteColorClassnames,
  autocompleteSpacingRules,
  isSpacingFunction,
} from './rules-completions';

export function extractRulesFromTheme(
  input: {
    rules: Rule<CurrentTheme>[];
    context: AutocompleteContext<CurrentTheme>;
  },
  onClass: (className: string | AutocompleteItem) => void,
) {
  let { rules, context } = input;

  for (const rule of rules) {
    const [pattern, resolver, backupResolver] = asArray(rule);

    const provider =
      typeof resolver === 'function'
        ? getAutocompleteProvider(resolver)
        : typeof backupResolver === 'function'
        ? getAutocompleteProvider(backupResolver)
        : undefined;

    const configProvider = typeof resolver !== 'function' && resolver;

    if (configProvider) {
      console.log('configProvider: ', configProvider);
    }

    for (const value of asArray(pattern)) {
      if (value === VARIANT_MARKER_RULE) {
        continue;
      }

      const condition = toCondition(value);

      const re = new RegExp(condition.source.replace(/\\[dw][*+?]*/g, '\0'), condition.flags);
      const pattern = genex(re);

      const count = pattern.count();

      if (count === Infinity) {
        if (provider) {
          const match: MatchResult = Object.create([String(value)], {
            index: { value: 0 },
            input: { value: String(value) },
            $$: { value: '' },
          });

          for (const completion of provider(match, context)) {
            if (typeof completion === 'string') {
              onClass(completion);
            } else {
              onClass(completion);
            }
          }
        } else {
          // console.warn(
          //   `Can not generate completion for rule ${condition}: infinite possibilities`,
          // );
        }
      } else {
        pattern.generate((name) => {
          const match = re.exec(name) as MatchResult | null;

          if (match) {
            match.$$ = name.slice(match[0].length);

            if (provider) {
              for (const completion of provider(match, context)) {
                onClass(completion);
              }
            } else {
              if (name.includes('\0') || name.endsWith('-')) {
                if (isSpacingFunction(name)) {
                  autocompleteSpacingRules(context.theme('spacing'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'leading-') {
                  autocompleteSpacingRules(context.theme('lineHeight'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'h-') {
                  autocompleteSpacingRules(context.theme('height'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'max-h-') {
                  autocompleteSpacingRules(context.theme('maxHeight'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'min-h-') {
                  autocompleteSpacingRules(context.theme('minHeight'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'w-') {
                  autocompleteSpacingRules(context.theme('width'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'max-w-') {
                  autocompleteSpacingRules(context.theme('maxWidth'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'min-w-') {
                  autocompleteSpacingRules(context.theme('minWidth'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'flex-') {
                  autocompleteSpacingRules(context.theme('flex'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'aspect-') {
                  autocompleteSpacingRules(context.theme('aspectRatio'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'font-') {
                  autocompleteSpacingRules(context.theme('fontWeight'), (space) => {
                    onClass(`${name}${space}`);
                  });
                  for (const key of Object.keys(context.theme('fontFamily'))) {
                    onClass(`${name}${key}`);
                  }
                }
                if (name.includes('rounded-')) {
                  autocompleteSpacingRules(context.theme('borderRadius'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name.includes('shadow-')) {
                  autocompleteSpacingRules(context.theme('boxShadow'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'bg-' || name == 'text-') {
                  autocompleteColorClassnames(context.theme('colors'), (color) => {
                    onClass(`${name}${color}`);
                  });
                  if (name == 'text-') {
                    autocompleteSpacingRules(context.theme('fontSize'), (space) => {
                      onClass(`${name}${space}`);
                    });
                    // @ts-expect-error
                    autocompleteSpacingRules(context.theme('textAlign'), (space) => {
                      if (space == 'DEFAULT') {
                        onClass(`${name}`);
                      } else {
                        onClass(`${name}${space}`);
                      }
                    });
                  }
                } else {
                  console.warn(
                    `2. Can not generate completion for rule ${name} with condition ${condition}: missing provider`,
                  );
                }
              } else {
                onClass(name);
              }
            }
          }
        });
      }
    }
  }
}
