import { BaseTheme, ExtractUserTheme, ThemeFunction } from '@twind/core';
import { TailwindTheme } from '@universal-labs/twind-adapter';
import genex from 'genex';
import { isSpacingFunction } from './isSpacingRule';
import {
  autocompleteColorClassnames,
  autocompleteSpacingRules,
  extractRuleModifiers,
} from './rulesCompletions';

export function evaluatePattern(
  pattern: ReturnType<typeof genex>,
  theme: ThemeFunction<ExtractUserTheme<BaseTheme & TailwindTheme>>,
  onClass: (data: string) => void,
) {
  pattern.generate((name) => {
    if (name.includes('\0') || name.endsWith('-')) {
      let injected = false;
      if (isSpacingFunction(name)) {
        injected = true;
        extractRuleModifiers({ prefix: name, themeValue: theme('spacing') }, (modifier) => {
          onClass(modifier);
        });
      }
      if (name == 'leading-') {
        injected = true;
        extractRuleModifiers({ prefix: name, themeValue: theme('lineHeight') }, (modifier) => {
          onClass(modifier);
        });
      }
      if (name.includes('skew-')) {
        injected = true;
        extractRuleModifiers({ prefix: name, themeValue: theme('skew') }, (modifier) => {
          onClass(modifier);
        });
      }
      if (name.includes('translate-')) {
        injected = true;
        extractRuleModifiers({ prefix: name, themeValue: theme('translate') }, (modifier) => {
          onClass(modifier);
        });
      }
      if (name.includes('scale-')) {
        injected = true;
        autocompleteSpacingRules(theme('scale'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name.includes('rotate-')) {
        injected = true;
        autocompleteSpacingRules(theme('rotate'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name == 'h-') {
        injected = true;
        extractRuleModifiers({ prefix: name, themeValue: theme('height') }, (modifier) => {
          onClass(modifier);
        });
      }
      if (name == 'max-h-') {
        injected = true;
        extractRuleModifiers({ prefix: name, themeValue: theme('maxHeight') }, (modifier) => {
          onClass(modifier);
        });
      }
      if (name == 'min-h-') {
        injected = true;
        extractRuleModifiers({ prefix: name, themeValue: theme('minHeight') }, (modifier) => {
          onClass(modifier);
        });
      }
      if (name == 'w-') {
        injected = true;
        extractRuleModifiers({ prefix: name, themeValue: theme('width') }, (modifier) => {
          onClass(modifier);
        });
      }
      if (name == 'max-w-') {
        injected = true;
        autocompleteSpacingRules(theme('maxWidth'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name == 'min-w-') {
        injected = true;
        autocompleteSpacingRules(theme('minWidth'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name == 'flex-') {
        injected = true;
        autocompleteSpacingRules(theme('flex'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name == 'aspect-') {
        injected = true;
        autocompleteSpacingRules(theme('aspectRatio'), (space) => {
          onClass(`${name}${space}`);
        });
      }

      if (name.includes('opacity-')) {
        injected = true;
        autocompleteSpacingRules(theme('opacity'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name == 'font-') {
        injected = true;
        autocompleteSpacingRules(theme('fontWeight'), (space) => {
          onClass(`${name}${space}`);
        });
        for (const key of Object.keys(theme('fontFamily'))) {
          onClass(`${name}${key}`);
        }
      }
      if (name.includes('border-')) {
        injected = true;
        autocompleteSpacingRules(theme('borderWidth'), (space) => {
          onClass(`${name}${space}`);
        });
        autocompleteColorClassnames(theme('colors'), (color) => {
          onClass(`${name}${color}`);
        });
        for (const key of ['solid', 'dashed', 'dotted', 'double', 'none', 'hidden']) {
          onClass(`${name}${key}`);
        }
      }
      if (name.includes('rounded-')) {
        injected = true;
        autocompleteSpacingRules(theme('borderRadius'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name == 'z-') {
        injected = true;
        autocompleteSpacingRules(theme('zIndex'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name == 'basis-') {
        injected = true;
        autocompleteSpacingRules(theme('flexBasis'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name == 'grow-') {
        injected = true;
        autocompleteSpacingRules(theme('flexGrow'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name.includes('justify-')) {
        injected = true;
        if (name.includes('justify-content')) {
          for (const key of ['start', 'end', 'center', 'between', 'around', 'evenly']) {
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
        autocompleteSpacingRules(theme('ringColor'), (space) => {
          onClass(`${name}${space}`);
        });
        autocompleteSpacingRules(theme('ringWidth'), (space) => {
          onClass(`${name}${space}`);
        });
        autocompleteSpacingRules(theme('ringOpacity'), (space) => {
          onClass(`${name}${space}`);
        });
        autocompleteSpacingRules(theme('ringOffsetWidth'), (space) => {
          onClass(`${name}${space}`);
        });
        autocompleteSpacingRules(theme('ringOffsetColor'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name.includes('shadow-')) {
        injected = true;
        autocompleteSpacingRules(theme('boxShadow'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name.includes('divide-')) {
        injected = true;
        autocompleteSpacingRules(theme('divideWidth'), (space) => {
          onClass(`${name}${space}`);
        });
        for (const key of ['solid', 'dashed', 'dotted', 'double', 'none', 'hidden']) {
          onClass(`${name}${key}`);
        }
        autocompleteSpacingRules(theme('divideOpacity'), (space) => {
          onClass(`${name}${space}`);
        });
        autocompleteSpacingRules(theme('divideColor'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name.includes('gap-')) {
        injected = true;
        autocompleteSpacingRules(theme('gap'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name.includes('gap-')) {
        injected = true;
        autocompleteSpacingRules(theme('spacing'), (space) => {
          onClass(`${name}${space}`);
        });
      }
      if (name == 'bg-' || name == 'text-') {
        injected = true;
        autocompleteColorClassnames(theme('colors'), (color) => {
          onClass(`${name}${color}`);
        });
        if (name == 'text-') {
          injected = true;
          autocompleteSpacingRules(theme('fontSize'), (space) => {
            onClass(`${name}${space}`);
          });
          // @ts-expect-error
          autocompleteSpacingRules(theme('textAlign'), (space) => {
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
    }
  });
}
