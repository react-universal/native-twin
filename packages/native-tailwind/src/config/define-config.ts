import type {
  Preset,
  TailwindConfig,
  TailwindUserConfig,
  TailwindPresetConfig,
} from '../types/config.types';
import type { __Theme__ } from '../types/theme.types';
import { asArray } from '../utils/helpers';
import { defaultVariants } from './defaults/variants';

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
    variants: asArray((userConfig.variants ?? []).concat(defaultVariants)),
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
      variants: userConfig.variants,
    },
  ])) {
    const { ignorelist, preflight, rules, theme, variants } =
      typeof preset == 'function' ? preset(config) : (preset as TailwindPresetConfig<Theme>);
    config = {
      preflight,
      root: config.root,
      variants: config.variants?.concat(variants ?? []),
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
