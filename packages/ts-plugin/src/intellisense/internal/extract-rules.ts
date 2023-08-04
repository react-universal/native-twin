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
import { autocompleteColorClassnames } from './color-rules';

export function extractRulesFromTheme(
  input: {
    rules: Rule<CurrentTheme>[];
    context: AutocompleteContext<CurrentTheme>;
  },
  onClass: (className: string | AutocompleteItem) => void,
) {
  let { rules, context } = input;
  for (const rule of rules) {
    const [pattern, resolver, ...rest] = asArray(rule);
    // console.log('RULE: ', rule);

    const provider = typeof resolver === 'function' && getAutocompleteProvider(resolver);
    const configProvider = typeof resolver !== 'function' && resolver;
    if (configProvider) {
      console.log('configProvider: ', configProvider);
    }
    if (rest.length) {
      console.log('REST: ', rule, rest);
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
          console.warn(
            `Can not generate completion for rule ${condition}: infinite possibilities`,
          );
        }
        continue;
      }

      pattern.generate((name) => {
        const match = re.exec(name) as MatchResult | null;
        // console.log('MATCH: ', match);

        if (match) {
          match.$$ = name.slice(match[0].length);

          if (provider) {
            for (const completion of provider(match, context)) {
              onClass(completion);
            }
          }
          if (!provider) {
            if (name.includes('\0') || name.endsWith('-')) {
              if (typeof resolver === 'function') {
                if (name == 'bg-' || name == 'text-') {
                  autocompleteColorClassnames(context.theme('colors'), (color) => {
                    onClass(`${name}${color}`);
                  });
                } else {
                  // console.warn(
                  //   `2. Can not generate completion for rule ${condition} with ${JSON.stringify(
                  //     name,
                  //   )}: missing provider`,
                  // );
                }
                // console.log('RESOLVED: ', resolved);
              }
            } else {
              // console.log('WITHOUT_PROVIDER: ', name);
              onClass(name);
            }
          }
        }
      });
    }
  }
}
