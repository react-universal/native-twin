import {
  type __Theme__,
  createTailwind,
  createThemeContext,
  defineConfig,
  type RuntimeTW,
  type TailwindConfig,
  type ThemeContext,
} from '@native-twin/core';
import type ts from 'typescript';
import '@native-twin/core';
import { createVirtualSheet, type SheetEntry } from '@native-twin/css';
import type { NativeTwinPluginConfiguration } from '@native-twin/language-service';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import * as Option from 'effect/Option';
import { requireJS } from '../utils/load-config';

export type InternalTwinConfig = TailwindConfig<__Theme__ & TailwindPresetTheme>;
export type InternalTwFn = RuntimeTW<__Theme__ & TailwindPresetTheme, SheetEntry[]>;
export type InternalTwinThemeContext = ThemeContext<__Theme__ & TailwindPresetTheme>;

export const createTwin = (info: ts.server.PluginCreateInfo) => {
  const pluginConfig: NativeTwinPluginConfiguration = {
    jsxAttributes: ['tw', 'apply', 'css', 'styled', 'variants'],
    functions: ['tw', 'class', 'className', 'variants'],
    configPath: '',
    trace: { server: 'off' },
    debug: false,
    enable: true,
  };

  const twinConfig = loadUserTwinConfigFile(info);
  const twin = createTwinHandlers(twinConfig);

  return {
    pluginConfig,
    twinConfig,
    twin,
  };
};

export const createTwinHandlers = (config: InternalTwinConfig) => {
  const globalSheet = createVirtualSheet();
  const tw = createTailwind(config, globalSheet);
  const context = createThemeContext(config);

  return {
    globalSheet,
    tw,
    context,
  };
};

const loadUserTwinConfigFile = (info: ts.server.PluginCreateInfo): InternalTwinConfig => {
  const rootDir = info.project.getCurrentDirectory();
  const file = `${rootDir}/tailwind.config.ts`;
  const fileExists = info.project.projectService.host.fileExists(file);
  if (fileExists) {
    const config = requireJS(file).pipe(Option.getOrNull);
    if (config) {
      return defineConfig(config);
    }
  }
  return defineConfig({
    content: [],
    presets: [],
  });
};
