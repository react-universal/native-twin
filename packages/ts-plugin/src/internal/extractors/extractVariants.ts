import genex from 'genex';
import { CurrentTheme } from '../../types';
import {
  AutocompleteContext,
  AutocompleteItem,
  MatchResult,
  Variant,
  asArray,
  getAutocompleteProvider,
} from '@universal-labs/twind-native';
import { toCondition } from '../../utils';

export function extractVariants(
  input: {
    variants: Variant<CurrentTheme>[];
    deferreds: (() => void)[];
    context: AutocompleteContext<CurrentTheme>;
  },
  onVariant: (data: string | AutocompleteItem) => void,
) {
  const { variants, deferreds, context } = input;
  for (const [pattern, resolver] of variants) {
    const provider = typeof resolver === 'function' && getAutocompleteProvider(resolver);

    for (const value of asArray(pattern)) {
      const condition = toCondition(value);

      const re = new RegExp(condition.source.replace(/\\[dw][*+?]*/g, '\0'), condition.flags);
      const pattern = genex(re);
      const count = pattern.count();

      if (count === Infinity) {
        if (provider) {
          deferreds.push(() => {
            const match: MatchResult = Object.create([String(value)], {
              index: { value: 0 },
              input: { value: String(value) },
              $$: { value: '' },
            });

            for (const completion of provider(match, context)) {
              onVariant(completion);
            }
          });
        } else {
          // console.warn(
          //   `Can not generate completion for variant ${condition}: infinite possibilities`,
          // );
        }
      } else {
        pattern.generate((value) => {
          const match = re.exec(value) as MatchResult | null;

          if (match) {
            match.$$ = value.slice(match[0].length);

            if (provider) {
              for (const completion of provider(match, context)) {
                onVariant(completion);
              }
            } else {
              if (value.includes('\0') || value.endsWith('-')) {
                // console.warn(
                //   `Can not generate completion for variant ${condition} with ${JSON.stringify(
                //     value,
                //   )}: missing provider`,
                // );
              } else {
                onVariant(value);
              }
            }
          }
        });
      }
    }
  }
}
