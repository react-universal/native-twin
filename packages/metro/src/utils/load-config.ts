/* eslint-disable @typescript-eslint/no-unused-vars */
import micromatch from 'micromatch';
import path from 'node:path';
import * as NativeTwin from '@native-twin/core';
import type { SheetEntry, createVirtualSheet } from '@native-twin/css';
import * as NativeTwinCss from '@native-twin/css';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { requireJS } from './load-js';

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

export function getUserNativeWindConfig(
  tailwindConfigPath: string,
  output: string,
): NativeTwin.TailwindConfig<NativeTwin.__Theme__ & TailwindPresetTheme> {
  const config = requireJS(path.resolve(tailwindConfigPath));
  const content = config.content;
  const contentArray = content;
  const matchesOutputDir = contentArray.some((pattern: string) => {
    if (typeof pattern !== 'string') return false;
    return micromatch.isMatch(output, pattern);
  });

  if (matchesOutputDir) {
    throw new Error(
      `NativeTwin: Your '${tailwindConfigPath}#content' includes the output file ${output} which will cause an infinite loop. Please read https://tailwindcss.com/docs/content-configuration#styles-rebuild-in-an-infinite-loop`,
    );
  }
  return config;
}

export function setupNativeTwin(
  config: any,
  _options: { platform: string; hot: boolean; dev: boolean },
) {
  if (tw) return tw;
  const nativeWind = loadNativeTwin();
  tw = loadNativeTwinConfig(nativeWind, config);
  console.log('TW: ', tw);

  return tw;
}
