import { defineConfig } from '../config/define-config';
import { createTailwind } from '../tailwind';
import type { TailwindConfig, TailwindUserConfig } from '../types/config.types';
import type { RuntimeTW, __Theme__ } from '../types/theme.types';

/**
 * @group Runtime
 * @param config
 * @param isProduction
 */
export function install<Theme extends __Theme__ = __Theme__>(
  config: TailwindConfig<Theme>,
  isProduction?: boolean,
): RuntimeTW<Theme & __Theme__>;

export function install<Theme = __Theme__>(
  config: TailwindUserConfig<Theme>,
  isProduction?: boolean,
): RuntimeTW<__Theme__ & Theme>;

export function install(
  config: TailwindConfig | TailwindUserConfig,
  _isProduction = false,
): RuntimeTW {
  const config$ = defineConfig(config as TailwindUserConfig);

  return createTailwind({
    ...config$,
  } as any);
}
