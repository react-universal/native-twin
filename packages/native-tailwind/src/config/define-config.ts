import { toArray } from '../common/fn.helpers';
import { BaseTheme } from '../theme.types';
import { baseTailwindTheme } from '../theme/baseTheme';
import { ExtractThemes, TailwindConfig, TailwindUserConfig } from '../config.types';
import * as colors from '../theme/colors';
import { tailwindBaseRules } from '../theme/tailwind-rules';

export function defineConfig<Theme extends BaseTheme = BaseTheme>({
  ...userConfig
}: TailwindUserConfig<Theme>): TailwindConfig<BaseTheme & ExtractThemes<Theme>> {
  const config: TailwindConfig<BaseTheme & ExtractThemes<Theme>> = {
    ignorelist: toArray(userConfig.ignorelist),
    rules: [...toArray(userConfig.rules), ...toArray(tailwindBaseRules)],
    theme: {
      colors,
      ...baseTailwindTheme,
      ...((userConfig.theme ?? {}) as TailwindConfig<
        BaseTheme & ExtractThemes<Theme>
      >['theme']),
      extend: {
        ...((userConfig.theme?.extend ?? {}) as TailwindConfig<
          BaseTheme & ExtractThemes<Theme>
        >['theme']['extend']),
      },
    },
  };
  return config;
}
