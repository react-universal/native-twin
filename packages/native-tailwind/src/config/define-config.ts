import type {
  Preset,
  TailwindConfig,
  TailwindUserConfig,
  TailwindPresetConfig,
} from '../types/config.types';
import type { __Theme__ } from '../types/theme.types';
import { asArray } from '../utils/helpers';

export function defineConfig<
  Theme extends __Theme__ = __Theme__,
  Presets extends Preset<any>[] = Preset[],
>({
  presets = [] as unknown as Presets,
  ...userConfig
}: TailwindUserConfig<Theme, Presets>): TailwindConfig<__Theme__> {
  let config: TailwindConfig<__Theme__> = {
    ignorelist: asArray(userConfig.ignorelist),
    rules: asArray(userConfig.rules),
    root: {
      rem: userConfig.root?.rem ?? 16,
      ...userConfig.root,
    },
    theme: {},
  };
  for (const preset of asArray([
    ...presets,
    {
      theme: userConfig.theme as TailwindConfig<__Theme__>['theme'],
      root: userConfig.root,
    },
  ])) {
    const { ignorelist, preflight, rules, theme } =
      typeof preset == 'function' ? preset(config) : (preset as TailwindPresetConfig<Theme>);
    config = {
      preflight,
      root: config.root,
      theme: {
        ...config.theme,
        ...theme,
        extend: {
          ...config.theme.extend,
          ...theme?.extend,
        },
      },

      // variants: [...config.variants, ...asArray(variants)],
      rules: [...config.rules, ...asArray(rules)],
      ignorelist: [...config.ignorelist, ...asArray(ignorelist)],
    } as TailwindConfig<__Theme__>;
  }
  return config;
}
