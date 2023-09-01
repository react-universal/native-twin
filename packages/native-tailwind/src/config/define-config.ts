import type { BaseTheme } from '../types/theme.types';
import type { ExtractThemes, TailwindConfig, TailwindUserConfig } from '../types/config.types';
import { toArray } from '../common/fn.helpers';
import { baseTailwindTheme } from '../theme/baseTheme';
import * as colors from '../theme/colors';
import { tailwindBaseRules } from '../theme/tailwind-rules';

export function defineConfig<Theme extends BaseTheme = BaseTheme>({
  ...userConfig
}: TailwindUserConfig<Theme>): TailwindConfig<BaseTheme & ExtractThemes<Theme>> {
  const config: TailwindConfig<BaseTheme & ExtractThemes<Theme>> = {
    ignorelist: toArray(userConfig.ignorelist),
    rules: [...toArray(userConfig.rules), ...toArray(tailwindBaseRules)],
    theme: {
      colors: {
        white: '#fff',
        black: '#000',
        current: 'currentColor',
        ...colors,
      },
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
