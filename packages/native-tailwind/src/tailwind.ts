import { TailwindConfig, TailwindUserConfig } from './config.types';
import { defineConfig } from './config/define-config';
import { BaseTheme } from './theme.types';
import { createThemeContext } from './theme/theme.context';
import { RuleHandler } from './theme/entities/Rule';
import { StringLike } from './util.types';
import { Sheet, virtual } from './css/sheets';
import { parseRawRules } from './parsers/class-names';

export function createTailwind<Theme = BaseTheme, Target = unknown>(
  userConfig: TailwindUserConfig<Theme>,
  sheet: Sheet<Target>,
) {
  const config = defineConfig(userConfig) as TailwindConfig<BaseTheme>;
  const context = createThemeContext<BaseTheme>(config);
  let cache = new Map<string, string>();
  let insertedRules = new Set<string>();
  return Object.defineProperties(
    function tw(tokens: StringLike) {
      const parsed = parseRawRules(tokens);
      console.log('PARSED: ', parsed);
    },
    Object.getOwnPropertyDescriptors({
      get target() {
        return [];
      },
    }),
  );

  function createRulePatterns() {
    return config.rules.map((x) => new RuleHandler(x));
  }
}

const tw = createTailwind({ ignorelist: [] }, virtual(true));
tw('bg-black md(bg-blue-200)'); //?
