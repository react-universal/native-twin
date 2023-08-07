import type {
  Twind,
  BaseTheme,
  TwindConfig,
  TwindUserConfig,
  Preset,
  ExtractThemes,
} from '../types';

import { defineConfig } from '../config/define-config';
import { setup } from './runtime';
import { getSheet } from '../sheets/sheets';

/**
 * @group Runtime
 * @param config
 * @param isProduction
 */
export function install<Theme extends BaseTheme = BaseTheme>(
  config: TwindConfig<Theme>,
  isProduction?: boolean,
): Twind<Theme & BaseTheme>;

export function install<Theme = BaseTheme, Presets extends Preset<any>[] = Preset[]>(
  config: TwindUserConfig<Theme, Presets>,
  isProduction?: boolean,
): Twind<BaseTheme & ExtractThemes<Theme, Presets>>;

export function install(config: TwindConfig | TwindUserConfig, isProduction = false): Twind {
  const config$ = defineConfig(config as TwindUserConfig);

  return setup(
    {
      ...config$,
      // in production use short hashed class names
      hash: config$.hash ?? isProduction,
    },
    () => getSheet(!isProduction),
  );
}
