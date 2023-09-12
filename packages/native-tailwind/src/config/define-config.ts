import { themeRules } from '../tailwind-preset/tailwind-rules';
import type { TailwindConfig, TailwindUserConfig } from '../types/config.types';
import type { __Theme__ } from '../types/theme.types';
import { asArray } from '../utils/helpers';
import { createTailwindTheme } from './create-theme';

export function defineConfig<Theme extends __Theme__ = __Theme__>({
  ...userConfig
}: TailwindUserConfig<Theme>): TailwindConfig<__Theme__> {
  const theme = createTailwindTheme(userConfig.theme);
  const config: TailwindConfig<__Theme__> = {
    ignorelist: asArray(userConfig.ignorelist),
    rules: [...asArray(userConfig.rules), ...asArray(themeRules)],
    theme: {
      ...theme,
      extend: userConfig.theme?.extend,
    },
  };
  return config;
}
