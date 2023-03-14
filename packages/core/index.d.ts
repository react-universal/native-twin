import type { Root } from 'postcss';
import type { CssInJs } from 'postcss-js';
import { Config } from 'tailwindcss';
import type { createTailwindConfig } from './src/config/tailwind-config';

export interface TailwindConfig {
  important?: Config['important'];
  prefix?: Config['prefix'];
  separator?: Config['separator'];
  safelist?: Config['safelist'];
  presets?: Config['presets'];
  future?: Config['future'];
  experimental?: Config['experimental'];
  darkMode?: Config['darkMode'];
  theme?: Config['theme'];
  corePlugins?: Config['corePlugins'];
  plugins?: Config['plugins'];
}

type Content = string | Record<string, boolean> | TemplateStringsArray | Content[];

type Options = { merge?: boolean; minify?: boolean };

export function setup(config: Config): {
  style: (twClasses: string) => {
    css: string;
    JSS: CssInJs;
    postcssRoot: Root;
  };
  tailwindConfigHandler: ReturnType<typeof createTailwindConfig>;
};
