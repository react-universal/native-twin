import { Config } from 'tailwindcss';

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
