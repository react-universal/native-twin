// @ts-expect-error
import type { PluginAPI } from 'tailwindcss/plugin';

export type CustomPluginFunction = (
  helpers: PluginAPI,
  notSupported: (property: string) => () => void,
) => void;
