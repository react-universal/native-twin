import { TailwindConfig, TailwindUserConfig } from './types/config.types';
import { defineConfig } from './config/define-config';
import { BaseTheme } from './types/theme.types';
import { createThemeContext } from './theme/theme.context';
import { StringLike } from './types/util.types';
import { Sheet, virtual } from './css/sheets';
import { parseRawRules } from './parsers/class-names';

export function createTailwind<Theme = BaseTheme, Target = unknown>(
  userConfig: TailwindUserConfig<Theme>,
  _sheet: Sheet<Target>,
) {
  const config = defineConfig(userConfig) as TailwindConfig<BaseTheme>;
  const context = createThemeContext<BaseTheme>(config);
  return Object.defineProperties(
    function tw(tokens: StringLike) {
      const result: any[] = [];
      const parsedRules = parseRawRules(tokens);
      for (const rule of parsedRules) {
        const ruleData = context.r(rule.n);
        if (ruleData) {
          result.push(ruleData);
        }
      }
      return result;
    },
    Object.getOwnPropertyDescriptors({
      get target() {
        return [];
      },
    }),
  );
}

const tw = createTailwind({ ignorelist: [] }, virtual(true));
tw('bg-black md:(bg-blue-200/10) text-blue-200 text-center'); //?
