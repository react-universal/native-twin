import * as Option from 'effect/Option';
import fs from 'node:fs';
import path from 'node:path';
import * as NativeTwin from '@native-twin/core';
import type { createVirtualSheet } from '@native-twin/css';
import type * as NativeTwinCss from '@native-twin/css';
import { TWIN_DEFAULT_FILES } from '../../constants/plugin.constants';
import type { TwinBabelOptions } from '../../types/plugin.types';
import { InternalTwFn, InternalTwinConfig } from '../../types/twin.types';
import { requireJS } from '../../utils/load-js';

let tw: ReturnType<typeof loadNativeTwinConfig> | null = null;

function loadNativeTwin(): typeof NativeTwin {
  return requireJS('@native-twin/core');
}

function loadVirtualSheet(): ReturnType<typeof createVirtualSheet> {
  return (requireJS('@native-twin/css') as typeof NativeTwinCss).createVirtualSheet();
}

function loadNativeTwinConfig(
  mod: typeof NativeTwin,
  config: NativeTwin.TailwindConfig<InternalTwinConfig>,
  options: TwinBabelOptions,
): InternalTwFn {
  return mod.createTailwind(config, loadVirtualSheet());
}

export function getUserTwinConfig(
  rootDir: string,
  options: TwinBabelOptions,
): NativeTwin.TailwindConfig<InternalTwinConfig> {
  const twinConfigPath = getTwinConfigPath(rootDir, options);
  return twinConfigPath.pipe(
    Option.map((x) => requireJS(x) as NativeTwin.TailwindConfig<InternalTwinConfig>),
    Option.map((x) =>
      NativeTwin.defineConfig({
        ...x,
        mode: options.platform === 'web' ? 'web' : 'native',
        root: { rem: 16 },
      }),
    ),
    Option.getOrElse(() =>
      NativeTwin.defineConfig({
        content: [],
        mode: options.platform === 'web' ? 'web' : 'native',
        root: { rem: 16 },
      }),
    ),
  );
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
  config: NativeTwin.TailwindConfig<InternalTwinConfig>,
  options: TwinBabelOptions,
) {
  if (tw) {
    return tw;
  }
  const nativeTwin = loadNativeTwin();
  tw = loadNativeTwinConfig(nativeTwin, config, options);

  return tw;
}
