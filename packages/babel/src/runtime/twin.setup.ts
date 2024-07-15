import * as Option from 'effect/Option';
import fs from 'node:fs';
import path from 'node:path';

import type * as NativeTwin from '@native-twin/core';
import type { SheetEntry, createVirtualSheet } from '@native-twin/css';
import type * as NativeTwinCss from '@native-twin/css';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { TWIN_DEFAULT_FILES } from '../constants/plugin.constants';
import { TwinBabelOptions } from '../types/plugin.types';
import { requireJS } from '../utils/load-js';

let tw: ReturnType<typeof loadNativeTwinConfig> | null = null;

function loadNativeTwin(): typeof NativeTwin {
  return requireJS('@native-twin/core');
}

function loadVirtualSheet(): ReturnType<typeof createVirtualSheet> {
  return (requireJS('@native-twin/css') as typeof NativeTwinCss).createVirtualSheet();
}

function loadNativeTwinConfig(
  mod: typeof NativeTwin,
  config: any,
): NativeTwin.RuntimeTW<NativeTwin.__Theme__ & TailwindPresetTheme, SheetEntry[]> {
  return mod.createTailwind(config, loadVirtualSheet());
}

export function getUserTwinConfig(
  rootDir: string,
  options: TwinBabelOptions,
): Option.Option<NativeTwin.TailwindConfig<NativeTwin.__Theme__ & TailwindPresetTheme>> {
  const twinConfigPath = getTwinConfigPath(rootDir, options);
  return twinConfigPath.pipe(Option.map((x) => requireJS(x)));
}

const getTwinConfigPath = (rootDir: string, options: TwinBabelOptions) => {
  let twPath: string | undefined;
  if (options.twinConfigPath) {
    twPath = path.join(rootDir, options.twinConfigPath);
  }
  if (!twPath) {
    twPath = TWIN_DEFAULT_FILES.map((x) => path.join(rootDir, x)).find((x) =>
      fs.existsSync(x),
    );
  }

  return Option.fromNullable(twPath).pipe(Option.map((x) => path.resolve(x)));
};

export function setupNativeTwin(
  config: Option.Option<
    NativeTwin.TailwindConfig<NativeTwin.__Theme__ & TailwindPresetTheme>
  >,
  _options: { platform: string; hot: boolean; dev: boolean },
) {
  if (tw) {
    return Option.some(tw);
  }
  return config.pipe(
    Option.map((x) => {
      const nativeWind = loadNativeTwin();
      tw = loadNativeTwinConfig(nativeWind, x);

      return tw;
    }),
  );
}
