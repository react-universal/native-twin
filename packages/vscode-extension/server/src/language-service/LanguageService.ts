import genex from 'genex';
import { TailwindTheme, tw } from '@universal-labs/twind-adapter';
import { AutocompleteContext, BaseTheme, asArray } from '@universal-labs/twind-native';
import { VARIANT_MARKER_RULE } from '../internal/config';
import { evaluatePattern } from './parser/evaluatePattern';

const cache = new Map<string, string>();

export function createIntellisense() {
  const config = tw.config;
  const rules = tw.config.rules;
  extractRules();
  return {
    cache,
    getContext,
    config,
  };

  function getContext() {
    return {
      get context() {
        const theme = tw.theme;
        const context: AutocompleteContext<BaseTheme & TailwindTheme> = {
          get theme() {
            return theme;
          },
          get variants() {
            return {};
          },
        };
        return context;
      },
    };
  }

  function extractRules() {
    for (const rule of rules) {
      const [pattern] = asArray(rule);
      for (const value of asArray(pattern)) {
        if (value === VARIANT_MARKER_RULE) {
          continue;
        }

        const condition = toCondition(value);

        const re = new RegExp(
          condition.source.replace(/\\[dw][*+?]*/g, '\0'),
          condition.flags,
        );
        const pattern = genex(re);
        evaluatePattern(pattern, tw.theme, (className) => {
          cache.set(className, className);
        });
      }
    }
  }
}

function toCondition(value: string | RegExp): RegExp {
  // "visible" -> /^visible$/
  // "(float)-(left|right|none)" -> /^(float)-(left|right|none)$/
  // "auto-rows-" -> /^auto-rows-/
  // "gap(-|$)" -> /^gap(-|$)/
  return typeof value == 'string'
    ? new RegExp('^' + value + (value.includes('$') || value.slice(-1) == '-' ? '' : '$'))
    : value;
}
