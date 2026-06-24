import * as vm from 'node:vm';
import { createTailwind, defineConfig } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import * as Option from 'effect/Option';
import type { ImportedTwinConfig, InternalTwFn, TwinRunnerPlatform } from '../Config/Models';
import { maybeLoadJS } from './modules.utils';

// TODO: Remove once implements state
export const extractTwinConfig = (configPath: Option.Option<string>): ImportedTwinConfig => {
  return configPath.pipe(
    Option.flatMap(maybeLoadJS<ImportedTwinConfig>),
    Option.getOrElse(() => {
      // console.log('FAILED_TO_LOAD');
      return defineConfig({ content: [] });
    }),
  );
};

export const createTwinProcessor = (
  platform: TwinRunnerPlatform,
  twConfig: ImportedTwinConfig,
): InternalTwFn => {
  const context = vm.createContext({
    twConfig: defineConfig({
      ...twConfig,
      mode: platform,
    }),
    console: console,
    sheet: createVirtualSheet(),
    createTailwind: createTailwind,
    platform,
  });
  return vm.runInContext(
    `
    (() => {
      const tw = createTailwind(twConfig, sheet);
      return tw;
    })();
    `,
    context,
  );
};
