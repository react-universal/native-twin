import { toArray } from '../common/fn.helpers';
import { BaseTheme } from '../theme.types';
import { baseTailwindTheme } from '../theme/baseTheme';
import { ExtractThemes, TailwindConfig, TailwindUserConfig } from '../types';
import * as colors from '../theme/colors';

export function createTailwindConfig<Theme = BaseTheme>({
  ...userConfig
}: TailwindUserConfig<Theme>): TailwindConfig<BaseTheme & ExtractThemes<Theme>> {
  let config: TailwindConfig<BaseTheme & ExtractThemes<Theme>> = {
    ignorelist: toArray(userConfig.ignorelist),
    rules: toArray(userConfig.rules),
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
