import genex from 'genex';
import { TailwindTheme, tw } from '@universal-labs/twind-adapter';
import { AutocompleteContext, BaseTheme, asArray } from '@twind/core';
import { evaluatePattern } from './evaluatePattern';
import { toCondition } from '../utils';
import cssbeautify from 'cssbeautify';
import { VARIANT_MARKER_RULE } from '../constants/config.constants';

const cache = new Map<string, { className: string; css: string }>();

export function createIntellisense() {
  const config = tw.config;
  const rules = tw.config.rules;
  extractRules();
  return {
    cache,
    getContext,
    config,
    getCss,
  };

  function getCss(name: string) {
    const className = tw(name);
    const target = [...tw.target];
    tw.clear();
    return {
      className,
      css: cssbeautify(
        target
          .filter((rule) => !/^\s*\*\s*{/.test(rule))
          .join('\n')
          // Add whitespace after non-escaped ,
          .replace(/([^\\],)(\S)/g, '$1 $2'),
        // utility.replace(/([^\\],)(\S)/g, '$1 $2')!,
        {
          autosemicolon: true,
          indent: '  ',
          openbrace: 'end-of-line',
        },
      )
        .replace(/TYPESCRIPT_PLUGIN_PLACEHOLDER/g, '<...>')
        .replace(/^(\s*)--typescript_plugin_placeholder:\s*none\s*;$/gm, '$1/* ... */')
        .trim(),
    };
  }

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
          const data = getCss(className);
          if (data.css !== '') {
            cache.set(className, { className, css: data.css });
          }
        });
      }
    }
  }
}

export type CreateIntellisenseFn = ReturnType<typeof createIntellisense>;
