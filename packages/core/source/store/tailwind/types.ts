import type { Config } from 'tailwindcss/types/config';

export type ITailwindConfigStore = {
  config: Config;
  setConfig: (config: Config) => void;
  setup: (config: Config) => void;
};
