import type { createVirtualSheet } from '@native-twin/css';
import type * as NativeTwinCss from '@native-twin/css';
import * as Option from 'effect/Option';
import fs from 'node:fs';
import path from 'node:path';
import * as NativeTwin from '@native-twin/core';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import {
  TWIN_INPUT_CSS_FILE,
  TWIN_OUT_CSS_FILE,
  TWIN_STYLES_FILE,
  twinModuleExportString,
} from '../../constants';
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
        mode: options.platform === 'web' ? 'web' : x.mode ?? 'native',
        root: { rem: x.root.rem ?? 16 },
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

export const createTwinCSSFiles = ({
  outputDir,
  inputCSS: inputCss,
  twConfig,
}: {
  outputDir: string;
  inputCSS?: string;
  twConfig: NativeTwin.TailwindConfig<NativeTwin.__Theme__ & TailwindPresetTheme>;
}) => {
  if (!fs.existsSync(path.resolve(outputDir))) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!inputCss) {
    inputCss = path.join(outputDir, TWIN_INPUT_CSS_FILE);
    fs.writeFileSync(inputCss, '');
  }
  const outputCss = path.join(outputDir, TWIN_OUT_CSS_FILE);
  fs.writeFileSync(
    outputCss,
    `
:root {
  --twin-rem: ${twConfig.root.rem}px;
}  
  `,
  );
  return {
    inputCss: `${inputCss}`,
    outputCss,
  };
};

export const createCacheDir = (outputDir: string) => {
  if (!fs.existsSync(path.resolve(outputDir))) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(path.join(outputDir, TWIN_STYLES_FILE), twinModuleExportString);
};

export const deleteCacheDir = (outputDir: string) => {
  if (!fs.existsSync(path.resolve(outputDir))) {
    fs.rmdirSync(outputDir, { recursive: true });
  }
};
