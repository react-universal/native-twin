import { getSheet, type Sheet } from '@native-twin/css';
import { noop } from '@native-twin/helpers';
import { createTailwind } from '../native-twin';
import type { Preset, TailwindConfig, TailwindUserConfig } from '../types/config.types';
import type { ExtractThemes, RuntimeTW, __Theme__ } from '../types/theme.types';
import { mutationObserver } from './mutation-observer';

let active: RuntimeTW = noop as any as RuntimeTW;

function assertActive() {
  if (__DEV__ && !tw) {
    throw new Error(
      `No active instance found. Make sure to call setup or install before accessing tw.`,
    );
  }
}

export let tw: RuntimeTW<any> = /* #__PURE__ */ new Proxy(
  // just exposing the active as tw should work with most bundlers
  // as ES module export can be re-assigned BUT some bundlers to not honor this
  // -> using a delegation proxy here
  noop as unknown as RuntimeTW<any>,
  {
    apply(_target, _thisArg, args) {
      if (__DEV__) assertActive();
      return active.apply(_thisArg, args);
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

export type SheetFactory<Target> = () => Sheet<Target>;

export function setup<Theme extends __Theme__ = __Theme__, SheetTarget = unknown>(
  config?: TailwindConfig<Theme>,
  sheet?: Sheet<SheetTarget> | SheetFactory<SheetTarget>,
  target?: HTMLElement,
): RuntimeTW<Theme, SheetTarget>;

export function setup<
  Theme = __Theme__,
  Presets extends Preset<any>[] = Preset[],
  SheetTarget = unknown,
>(
  config?: TailwindUserConfig<Theme, Presets>,
  sheet?: Sheet<SheetTarget> | SheetFactory<SheetTarget>,
  target?: HTMLElement,
): RuntimeTW<__Theme__ & ExtractThemes<Theme, Presets>, SheetTarget>;

export function setup<Theme extends __Theme__ = __Theme__, Target = unknown>(
  config: TailwindConfig<any> | TailwindUserConfig<any> = { content: [] },
  sheet: Sheet<Target> | SheetFactory<Target> = getSheet as SheetFactory<Target>,
  target?: HTMLElement,
): RuntimeTW<Theme> {
  if ('destroy' in active) {
    active?.destroy();
  }
  // active = tw$ as RuntimeTW;
  const instance = createTailwind(
    config as TailwindUserConfig,
    typeof sheet == 'function' ? sheet() : sheet,
  );
  active = observe(instance, target);

  return active as unknown as RuntimeTW<Theme>;
}

export function observe<Theme extends __Theme__ = __Theme__>(
  tw$: RuntimeTW<Theme> = tw as unknown as RuntimeTW<Theme>,
  target: false | Node = typeof document != 'undefined' && document.documentElement,
): RuntimeTW<Theme> {
  if (target) {
    const observer = mutationObserver(tw$);

    observer.observe(target);

    // monkey patch tw.destroy to disconnect this observer
    const { destroy } = tw$;
    tw$.destroy = () => {
      observer.disconnect();
      destroy.call(tw$);
    };
  }

  return tw$;
}
