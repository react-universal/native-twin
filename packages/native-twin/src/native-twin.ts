/**********************************************
 * Readapted from Twind                       *
 * Credits: @sastan https://github.com/sastan *
 * Repo: https://github.com/tw-in-js/twind    *
 * ********************************************
 */
import { Layer, type Sheet, type SheetEntry } from '@universal-labs/css';
import { parseTWTokens, sortedInsertionIndex, interpolate } from '@universal-labs/css';
import { asArray } from '@universal-labs/helpers';
import { defineConfig } from './config/define-config';
import { parsedRuleToEntry } from './convert/ruleToEntry';
import { createThemeContext } from './theme/theme.context';
import type { Preset, TailwindConfig, TailwindUserConfig } from './types/config.types';
import type { ExtractThemes, RuntimeTW, __Theme__ } from './types/theme.types';

export function createTailwind<Theme extends __Theme__ = __Theme__, Target = unknown>(
  config: TailwindConfig<Theme>,
  sheet: Sheet<Target>,
): RuntimeTW<Theme, Target>;

export function createTailwind<
  Theme = __Theme__,
  Presets extends Preset<any>[] = Preset[],
  Target = unknown,
>(
  config: TailwindUserConfig<Theme, Presets>,
  sheet: Sheet<Target>,
): RuntimeTW<__Theme__ & ExtractThemes<Theme, Presets>, Target>;

export function createTailwind(
  userConfig: TailwindConfig<any> | TailwindUserConfig<any>,
  sheet: Sheet,
): RuntimeTW {
  const config = defineConfig(userConfig);
  const context = createThemeContext<__Theme__>(config);
  let cache = new Map<string, SheetEntry[]>();
  const insertedRules = new Set<string>();
  let sortedPrecedences: SheetEntry[] = [];

  const runtime = Object.defineProperties(
    function tw(tokens) {
      insertPreflight();
      tokens = interpolate`${[tokens]}`;
      if (cache.has(tokens)) {
        return cache.get(tokens);
      }
      const styles: SheetEntry[] = [];
      for (const rule of parseTWTokens(tokens)) {
        const entry = parsedRuleToEntry(rule, context);
        if (!insertedRules.has(entry.className)) {
          insert(entry);
        }
        styles.push(entry);
      }
      cache.set(tokens, styles);
      return styles;
    } as RuntimeTW,

    Object.getOwnPropertyDescriptors({
      get target() {
        return sheet.target;
      },
      theme: context.theme,
      get config() {
        return config;
      },
      snapshot() {
        const restoreSheet = sheet.snapshot();
        const cache$ = new Map(cache);

        return () => {
          restoreSheet();
          cache = cache$;
        };
      },
      clear() {
        sheet.clear();
        cache = new Map();
        insertedRules.clear();
        sortedPrecedences = [];
      },
      destroy() {
        this.clear();
        sheet.destroy();
      },
    }),
  );
  return runtime;

  function insert(entry: SheetEntry) {
    insertedRules.add(entry.className);
    if (entry.declarations.length == 0) {
      return;
    }
    const index = sortedInsertionIndex(sortedPrecedences, entry);
    sheet.insert(entry, index);
    sortedPrecedences.splice(index, 0, entry);
  }

  function insertPreflight() {
    if (!cache.size && config.mode === 'web' && config.preflight) {
      sheet.clear();
      for (let preflight of asArray(config.preflight)) {
        if (typeof preflight == 'function') {
          preflight = preflight(context);
        }

        if (preflight) {
          sheet.insertPreflight(preflight);
          for (const p of Object.entries(preflight)) {
            const entry: SheetEntry = {
              className: p[0],
              selectors: [],
              declarations: Object.entries(p[1]) as any,
              important: false,
              precedence: Layer.b,
            };
            sortedPrecedences.push(entry);
            cache.set(entry.className, [entry]);
          }
        }
      }
    }
  }
}
