import type {
  Preset,
  TailwindConfig,
  TailwindUserConfig,
  TailwindPresetConfig,
} from '../types/config.types';
import type { ExtractThemes, __Theme__ } from '../types/theme.types';
import { asArray } from '../utils/helpers';
import { defaultVariants } from './defaults/variants';

export function defineConfig<
  Theme extends __Theme__ = __Theme__,
  Presets extends Preset<any>[] = Preset[],
>({
  presets = [] as unknown as Presets,
  ...userConfig
}: TailwindUserConfig<Theme, Presets>): TailwindConfig<
  __Theme__ & ExtractThemes<Theme, Presets>
> {
  let config: TailwindConfig<__Theme__ & ExtractThemes<Theme, Presets>> = {
    darkMode: undefined,
    mode: userConfig.mode ?? 'native',
    preflight: userConfig.preflight !== false && [],
    ignorelist: asArray(userConfig.ignorelist),
    rules: asArray(userConfig.rules),
    variants: asArray(userConfig.variants).concat(defaultVariants),
    root: {
      rem: userConfig.root?.rem ?? 16,
      ...userConfig.root,
    },
    theme: {},
  };
  for (const preset of asArray([
    ...presets,
    {
      darkMode: userConfig.darkMode,
      preflight: userConfig.preflight !== false && asArray(userConfig.preflight),
      theme: userConfig.theme as TailwindConfig<__Theme__>['theme'],
      root: userConfig.root,
    },
  ])) {
    const { ignorelist, preflight, rules, theme, variants, darkMode } =
      typeof preset == 'function' ? preset(config) : (preset as TailwindPresetConfig<Theme>);
    config = {
      preflight: config.preflight !== false &&
        preflight !== false && [...asArray(config.preflight), ...asArray(preflight)],
      root: config.root,
      darkMode,
      theme: {
        ...config.theme,
        ...theme,
        extend: {
          ...config.theme.extend,
          ...theme?.extend,
        },
      },

      variants: [...config.variants, ...asArray(variants)],
      rules: [...config.rules, ...asArray(rules)],
      ignorelist: [...config.ignorelist, ...asArray(ignorelist)],
    } as TailwindConfig<__Theme__ & ExtractThemes<Theme, Presets>>;
  }
  return config;
}
