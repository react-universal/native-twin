import type { Config } from 'tailwindcss/types/config';
import type { TailwindFn } from 'twrnc';

export type ITailwindConfigStore = {
  config: Config;
  setConfig: (config: Config) => void;
  getStyles: TailwindFn;
  setup: (config: Config) => void;
};
