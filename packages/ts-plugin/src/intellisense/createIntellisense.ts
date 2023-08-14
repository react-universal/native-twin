import genex from 'genex';
import { TailwindTheme, tw } from '@universal-labs/twind-adapter';
import { AutocompleteContext, BaseTheme, asArray } from '@twind/core';
import { evaluatePattern } from './evaluatePattern';
import { formatCss, toCondition } from '../utils';
import { CssResolver } from '@universal-labs/css';
import { ConfigurationManager } from '../language-service/configuration';
import type { Suggestion } from '../types';
import QuickLRU from 'quick-lru';

export function createIntellisense() {
  const classesCache = new QuickLRU<string, Suggestion>({ maxSize: 20000 });
  const config = tw.config;
  const rules = tw.config.rules;
  extractRules();
  return {
    classesCache,
    getContext,
    config,
    getCss,
  };

  function getCss(name: string) {
    const className = tw(name);
    const target = [...tw.target];
    tw.clear();
    const sheet = CssResolver(target, {
      colorScheme: 'light',
      debug: false,
      deviceHeight: 1080,
      deviceWidth: 720,
      platform: 'ios',
      rem: 16,
    });
    return {
      className,
      sheet,
      css: formatCss(target),
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
        let canBeNegative = false;
        if (typeof value == 'string' && value.startsWith('-?')) {
          canBeNegative = true;
        }
        if (value === ConfigurationManager.VARIANT_MARKER_RULE) {
          continue;
        }

        const condition = toCondition(value);

        const re = new RegExp(
          condition.source.replace(/\\[dw][*+?]*/g, '\0'),
          condition.flags,
        );
        const pattern = genex(re);
        evaluatePattern(pattern, tw.theme, (className) => {
          if (className.startsWith('-') && canBeNegative) {
            console.log('CAN_BE: ', className, value);
            return;
          }
          const data = getCss(className);
          if (data.css !== '' && !classesCache.has(className)) {
            const item = { className, css: data.css, sheet: data.sheet.base, canBeNegative };
            classesCache.set(className, item);
          }
        });
      }
    }
  }
}

export type CreateIntellisenseFn = ReturnType<typeof createIntellisense>;
