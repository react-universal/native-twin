import { TailwindConfig, TailwindUserConfig } from './types/config.types';
import { defineConfig } from './config/define-config';
import { BaseTheme } from './types/theme.types';
import { createThemeContext } from './theme/theme.context';
import { StringLike } from './types/util.types';
import { Sheet } from './css/sheets';
import { parseTWTokens } from './parsers/tailwind.parser';

export function createTailwind<Theme = BaseTheme, Target = unknown>(
  userConfig: TailwindUserConfig<Theme>,
  _sheet: Sheet<Target>,
) {
  const config = defineConfig(userConfig) as TailwindConfig<BaseTheme>;
  const context = createThemeContext<BaseTheme>(config);
  return Object.defineProperties(
    function tw(tokens: StringLike) {
      const result: any[] = [];
      for (const rule of parseTWTokens(tokens)) {
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
