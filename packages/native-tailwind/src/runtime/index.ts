import type { FinalRule } from '../css/rules';
import { createTailwind } from '../tailwind';
import type { TailwindConfig, TailwindUserConfig } from '../types/config.types';
import type { Sheet } from '../types/css.types';
import type { RuntimeTW, __Theme__ } from '../types/theme.types';
import { noop } from '../utils/helpers';

let active: RuntimeTW;

function assertActive() {
  if (__DEV__ && !active) {
    throw new Error(
      `No active instance found. Make sure to call setup or install before accessing tw.`,
    );
  }
}

/**
 * A proxy to the currently active instance.
 * @group Style Injectors
 */
export const tw: RuntimeTW<any> = /* #__PURE__ */ new Proxy(
  // just exposing the active as tw should work with most bundlers
  // as ES module export can be re-assigned BUT some bundlers to not honor this
  // -> using a delegation proxy here
  noop as unknown as RuntimeTW<any>,
  {
    apply(_target, _thisArg, args) {
      if (__DEV__) assertActive();
      return active.apply(null, args);
    },

    get(target, property) {
      if (__DEV__) {
        // Workaround webpack accessing the prototype in dev mode
        if (!active && property in target) {
          return (target as any)[property];
        }

        assertActive();
      }

      // const value = active[property as keyof RuntimeTW];
      if (property === 'theme') {
        const value = active[property];
        return function () {
          if (__DEV__) assertActive();
          return value.apply(active, arguments as unknown as [string, string]);
        };
      }
      const value = active[property as Exclude<keyof RuntimeTW, 'theme'>];
      if (typeof value == 'function') {
        return function () {
          if (__DEV__) assertActive();
          return value.apply(active);
        };
      }

      return value;
    },
  },
);

export type SheetFactory = () => Sheet<FinalRule>;

export function setup<Theme extends __Theme__ = __Theme__>(
  config: TailwindConfig<any> | TailwindUserConfig<any> = {},
): RuntimeTW<Theme> {
  // active?.destroy();

  active = createTailwind(config as TailwindUserConfig);

  return active as unknown as RuntimeTW<Theme>;
}
