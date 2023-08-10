import genex from 'genex';
import { VARIANT_MARKER_RULE } from '../../constants/config.constants';
import { CurrentTheme } from '../../types';
import {
  AutocompleteContext,
  AutocompleteItem,
  MatchResult,
  Rule,
  asArray,
  getAutocompleteProvider,
} from '@twind/core';
import { toCondition, isSpacingFunction } from '../../utils';
import {
  autocompleteColorClassnames,
  autocompleteSpacingRules,
  extractRuleModifiers,
} from './rulesCompletions';

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
                let injected = false;
                if (isSpacingFunction(name)) {
                  injected = true;
                  extractRuleModifiers(
                    { prefix: name, themeValue: context.theme('spacing') },
                    (modifier) => {
                      onClass(modifier);
                    },
                  );
                }
                if (name == 'leading-') {
                  injected = true;
                  extractRuleModifiers(
                    { prefix: name, themeValue: context.theme('lineHeight') },
                    (modifier) => {
                      onClass(modifier);
                    },
                  );
                }
                if (name.includes('skew-')) {
                  injected = true;
                  extractRuleModifiers(
                    { prefix: name, themeValue: context.theme('skew') },
                    (modifier) => {
                      onClass(modifier);
                    },
                  );
                }
                if (name.includes('translate-')) {
                  injected = true;
                  extractRuleModifiers(
                    { prefix: name, themeValue: context.theme('translate') },
                    (modifier) => {
                      onClass(modifier);
                    },
                  );
                }
                if (name.includes('scale-')) {
                  injected = true;
                  autocompleteSpacingRules(context.theme('scale'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name.includes('rotate-')) {
                  injected = true;
                  autocompleteSpacingRules(context.theme('rotate'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'h-') {
                  injected = true;
                  extractRuleModifiers(
                    { prefix: name, themeValue: context.theme('height') },
                    (modifier) => {
                      onClass(modifier);
                    },
                  );
                }
                if (name == 'max-h-') {
                  injected = true;
                  extractRuleModifiers(
                    { prefix: name, themeValue: context.theme('maxHeight') },
                    (modifier) => {
                      onClass(modifier);
                    },
                  );
                }
                if (name == 'min-h-') {
                  injected = true;
                  extractRuleModifiers(
                    { prefix: name, themeValue: context.theme('minHeight') },
                    (modifier) => {
                      onClass(modifier);
                    },
                  );
                }
                if (name == 'w-') {
                  injected = true;
                  extractRuleModifiers(
                    { prefix: name, themeValue: context.theme('width') },
                    (modifier) => {
                      onClass(modifier);
                    },
                  );
                }
                if (name == 'max-w-') {
                  injected = true;
                  autocompleteSpacingRules(context.theme('maxWidth'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'min-w-') {
                  injected = true;
                  autocompleteSpacingRules(context.theme('minWidth'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'flex-') {
                  injected = true;
                  autocompleteSpacingRules(context.theme('flex'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'aspect-') {
                  injected = true;
                  autocompleteSpacingRules(context.theme('aspectRatio'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }

                if (name.includes('opacity-')) {
                  injected = true;
                  autocompleteSpacingRules(context.theme('opacity'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'font-') {
                  injected = true;
                  autocompleteSpacingRules(context.theme('fontWeight'), (space) => {
                    onClass(`${name}${space}`);
                  });
                  for (const key of Object.keys(context.theme('fontFamily'))) {
                    onClass(`${name}${key}`);
                  }
                }
                if (name.includes('border-')) {
                  injected = true;
                  autocompleteSpacingRules(context.theme('borderWidth'), (space) => {
                    onClass(`${name}${space}`);
                  });
                  autocompleteColorClassnames(context.theme('colors'), (color) => {
                    onClass(`${name}${color}`);
                  });
                  for (const key of [
                    'solid',
                    'dashed',
                    'dotted',
                    'double',
                    'none',
                    'hidden',
                  ]) {
                    onClass(`${name}${key}`);
                  }
                }
                if (name.includes('rounded-')) {
                  injected = true;
                  autocompleteSpacingRules(context.theme('borderRadius'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'z-') {
                  injected = true;
                  autocompleteSpacingRules(context.theme('zIndex'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'basis-') {
                  injected = true;
                  autocompleteSpacingRules(context.theme('flexBasis'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'grow-') {
                  injected = true;
                  autocompleteSpacingRules(context.theme('flexGrow'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name.includes('justify-')) {
                  injected = true;
                  if (name.includes('justify-content')) {
                    for (const key of [
                      'start',
                      'end',
                      'center',
                      'between',
                      'around',
                      'evenly',
                    ]) {
                      onClass(`${name}${key}`);
                    }
                  } else {
                    for (const key of ['start', 'end', 'center', 'stretch', 'baseline']) {
                      onClass(`${name}${key}`);
                    }
                  }
                }
                if (name.includes('align-')) {
                  injected = true;
                  if (name.includes('align-content')) {
                    for (const key of [
                      'center',
                      'start',
                      'end',
                      'between',
                      'around',
                      'evenly',
                      'stretch',
                      'baseline',
                    ]) {
                      onClass(`${name}${key}`);
                    }
                  } else {
                    for (const key of ['start', 'end', 'center', 'stretch', 'baseline']) {
                      onClass(`${name}${key}`);
                    }
                  }
                }
                if (name.includes('ring-')) {
                  injected = true;
                  autocompleteSpacingRules(context.theme('ringColor'), (space) => {
                    onClass(`${name}${space}`);
                  });
                  autocompleteSpacingRules(context.theme('ringWidth'), (space) => {
                    onClass(`${name}${space}`);
                  });
                  autocompleteSpacingRules(context.theme('ringOpacity'), (space) => {
                    onClass(`${name}${space}`);
                  });
                  autocompleteSpacingRules(context.theme('ringOffsetWidth'), (space) => {
                    onClass(`${name}${space}`);
                  });
                  autocompleteSpacingRules(context.theme('ringOffsetColor'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name.includes('shadow-')) {
                  injected = true;
                  autocompleteSpacingRules(context.theme('boxShadow'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name.includes('divide-')) {
                  injected = true;
                  autocompleteSpacingRules(context.theme('divideWidth'), (space) => {
                    onClass(`${name}${space}`);
                  });
                  for (const key of [
                    'solid',
                    'dashed',
                    'dotted',
                    'double',
                    'none',
                    'hidden',
                  ]) {
                    onClass(`${name}${key}`);
                  }
                  autocompleteSpacingRules(context.theme('divideOpacity'), (space) => {
                    onClass(`${name}${space}`);
                  });
                  autocompleteSpacingRules(context.theme('divideColor'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name.includes('gap-')) {
                  injected = true;
                  autocompleteSpacingRules(context.theme('gap'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name.includes('gap-')) {
                  injected = true;
                  autocompleteSpacingRules(context.theme('spacing'), (space) => {
                    onClass(`${name}${space}`);
                  });
                }
                if (name == 'bg-' || name == 'text-') {
                  injected = true;
                  autocompleteColorClassnames(context.theme('colors'), (color) => {
                    onClass(`${name}${color}`);
                  });
                  if (name == 'text-') {
                    injected = true;
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
                }
                if (!injected) {
                  // console.warn(
                  //   `2. Can not generate completion for rule ${name} with condition ${condition}: missing provider`,
                  // );
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
