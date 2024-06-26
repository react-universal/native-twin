import * as HashSet from 'effect/HashSet';
import {
  createTailwind,
  createThemeContext,
  cx,
  defineConfig,
  setup,
  tx,
} from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { DEFAULT_TWIN_CONFIG } from '../utils/constants.utils';
import { requireJS } from '../utils/load-js';
import type {
  InternalTwFn,
  InternalTwinConfig,
  InternalTwinThemeContext,
  TwinStore,
  TwinRuleCompletion,
  TwinVariantCompletion,
} from './native-twin.types';
import { createTwinStore } from './utils/native-twin.utils';

export class NativeTwinManagerService {
  tw: InternalTwFn;
  context: InternalTwinThemeContext;
  userConfig: InternalTwinConfig = DEFAULT_TWIN_CONFIG;
  completions: TwinStore = {
    twinRules: HashSet.empty<TwinRuleCompletion>(),
    twinVariants: HashSet.empty<TwinVariantCompletion>(),
  };

  constructor() {
    this.tw = this.getNativeTwin();
    this.context = this.getContext();
  }

  get cx() {
    return cx;
  }

  get tx() {
    return tx;
  }

  loadUserFile(configFile: string) {
    this.userConfig = this.getUserConfig(configFile);
    this.tw = this.getNativeTwin();
    this.context = this.getContext();

    this.completions = createTwinStore({
      config: this.userConfig,
      context: this.context,
      tw: this.tw,
    });
  }

  private getContext() {
    return createThemeContext(this.userConfig);
  }

  private getNativeTwin() {
    const sheet = createVirtualSheet();
    setup(this.userConfig, sheet);
    return createTailwind(this.userConfig, sheet);
  }

  private getUserConfig(filePath: string) {
    try {
      const file = requireJS(filePath);
      if (!file) {
        throw new Error('Cant resolve user config at path ' + filePath);
      }

      return defineConfig(file);
    } catch {
      throw new Error('Cant resolve user config');
    }
  }
}
