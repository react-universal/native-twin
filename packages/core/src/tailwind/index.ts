import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import type { DarkModeConfig } from 'tailwindcss/types/config';
import { boxShadow } from './box-shadow';
import { elevation } from './elevation';
// import { gap } from './gap';
import { translate } from './translate';

export interface NativePluginOptions {
  rem?: number;
  onError?: (error: any) => void;
}

export const nativePlugin = plugin.withOptions<NativePluginOptions>(
  function ({
    onError = () => {
      return;
    },
  } = {}) {
    function notSupported(property: string) {
      return () => {
        onError({ error: `${property} is not available on native` });
        return {};
      };
    }

    return (helpers) => {
      // for (const platform of platforms) {
      //   helpers.addVariant(platform, `&::${platform}`);
      // }

      // helpers.addVariant(
      //   'native',
      //   nativePlatforms.map((platform) => `&::${platform}`),
      // );
      translate(helpers, notSupported);

      // color(helpers, notSupported);
      // dark(helpers, notSupported);
      // space(helpers, notSupported);
      // divide(helpers, notSupported);
      // gap(helpers, notSupported);
      // fontSize(helpers);
      // lineHeight(helpers, notSupported);
      // pseudoClasses(helpers, notSupported);
      elevation(helpers, notSupported);
      // scale(helpers, notSupported);
      // rotate(helpers, notSupported);
      // skew(helpers, notSupported);
      boxShadow(helpers, notSupported);
      // boxShadowColor(helpers, notSupported);
      // groupIsolate(helpers, notSupported);
      // parent(helpers, notSupported);
    };
  },
  function () {
    const config: Partial<Config & { theme: { elevation: Record<string, string> } }> = {
      // We need to do this to force dark mode off
      darkMode: 'off' as DarkModeConfig,
      theme: {
        elevation: {
          sm: '1.5',
          DEFAULT: '3',
          md: '6',
          lg: '7.5',
          xl: '12.5',
          '2xl': '25',
          none: '0',
        },
        boxShadow: {
          sm: '0px 1px 2px rgba(0, 0, 0, 0.1)',
          DEFAULT: '0px 2px 6px rgba(0, 0, 0, 0.1)',
          md: '0px 6px 10px rgba(0, 0, 0, 0.1)',
          lg: '0px 10px 15px rgba(0, 0, 0, 0.1)',
          xl: '0px 20px 25px rgba(0, 0, 0, 0.1)',
          '2xl': '0px 25px 50px rgba(0, 0, 0, 0.1)',
          none: '0px 0px 0px rgba(0, 0, 0, 0)',
        },
      },
      corePlugins: {
        // These are v2 plugins that don't work well with this library
        // we only support v3, so its safe to disable them
        divideOpacity: false,
        borderOpacity: false,
        placeholderOpacity: false,
        ringOpacity: false,
        backgroundOpacity: false,
        textOpacity: false,

        // These libraries are replaced with custom logic
        boxShadow: false,
        boxShadowColor: false,
        // divideColor: false,
        // divideStyle: false,
        // divideWidth: false,
        lineHeight: true,
        fontSize: true,
        gap: true,
        rotate: false,
        scale: false,
        skew: false,
        space: false,
        transform: false,
        translate: false,
      },
    };

    return config as Config;
  },
);
