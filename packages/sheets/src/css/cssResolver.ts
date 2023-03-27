import { setup } from '@universal-labs/core';
import { reactNativeTailwindPreset } from '@universal-labs/core/tailwind/preset';
import type { Config } from 'tailwindcss';

class CssParser {
  private static instance: CssParser;
  private static processor: ReturnType<typeof setup>;
  private static config: Config = {
    content: ['__'],
    corePlugins: { preflight: false },
    presets: [reactNativeTailwindPreset({ baseRem: 16 })],
  };
  private constructor() {}

  public static getInstance(): CssParser {
    if (!CssParser.instance) {
      CssParser.instance = new CssParser();
    }

    return CssParser.instance;
  }

  public static setTailwindConfig(config: Config) {
    this.config = config;
    this.processor = setup(this.config);
  }

  public static get classNameStyle() {
    return this.processor.css;
  }
}

const setTailwindConfig = (config: Config) => {
  CssParser.setTailwindConfig(config);
};

const css = (className: string) => CssParser.classNameStyle(className);

export { css, setTailwindConfig };
