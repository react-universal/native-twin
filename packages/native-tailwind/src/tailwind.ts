import { TailwindConfig, TailwindUserConfig } from './config.types';
import { defineConfig } from './config/define-config';
import { BaseTheme } from './theme.types';
import { baseTailwindTheme } from './theme/baseTheme';
import * as colors from './theme/colors';
import { tailwindBaseRules } from './theme/tailwind-rules';
import { createThemeContext } from './theme/theme.context';
import { RuleHandler } from './theme/entities/Rule';

export function createTailwind<Theme = BaseTheme>({
  ignorelist = [],
  rules = [],
  theme = {},
}: TailwindUserConfig<Theme>) {
  const config = defineConfig({
    ignorelist: ignorelist,
    rules: [...rules, ...tailwindBaseRules],
    theme: {
      colors,
      ...baseTailwindTheme,
      ...theme,
      extend: {
        ...theme.extend,
      },
    },
  }) as TailwindConfig<BaseTheme>;
  const context = createThemeContext<BaseTheme>(config);
  // createRulePatterns().map((x) => x.extractThemeValues(context));
  return context;

  function createRulePatterns() {
    return config.rules.map((x) => new RuleHandler(x));
  }
}
