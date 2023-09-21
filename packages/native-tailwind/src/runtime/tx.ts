import { tw as tw$ } from '.';
import type { CSSValue } from '../types/css.types';
import type { ComponentSheet } from '../types/theme.types';
import { interpolate } from '../utils/string-utils';

export interface TxFunction {
  (...classes: CSSValue[]): ComponentSheet;

  (strings: TemplateStringsArray, ...interpolations: readonly CSSValue[]): ComponentSheet;

  bind(thisArg?: ((tokens: string) => ComponentSheet) | undefined | void): TxFunction;

  call(
    thisArg: ((tokens: string) => ComponentSheet) | undefined | void,
    ...classes: CSSValue[]
  ): ComponentSheet;
  call(
    thisArg: ((tokens: string) => string) | undefined | void,
    strings: TemplateStringsArray,
    ...interpolations: readonly CSSValue[]
  ): string;

  apply(
    thisArg: ((tokens: string) => ComponentSheet) | undefined | void,
    classes:
      | CSSValue[]
      | [strings: TemplateStringsArray, ...interpolations: readonly CSSValue[]],
  ): ComponentSheet;
}

/**
 * Combines {@link tw} and {@link cx}.
 *
 * Using the default `tw` instance:
 *
 * ```js
 * import { tw } from '@twind/core'
 * tx`underline ${falsy && 'italic'}`
 * tx('underline', falsy && 'italic')
 * tx({'underline': true, 'italic': false})
 *
 * // using a custom twind instance
 * import { tw } from './custom/twind'
 * import { tw } from './custom/twind'
 * tx.bind(tw)
 * ```
 *
 * Using a custom `tw` instance:
 *
 * ```js
 * import { tx as tx$ } from '@twind/core'
 * import { tw } from './custom/twind'
 *
 * export const tx = tx$.bind(tw)
 *
 * tx`underline ${falsy && 'italic'}`
 * tx('underline', falsy && 'italic')
 * tx({'underline': true, 'italic': false})
 * ```
 *
 * @group Style Injectors
 * @param this {@link RuntimeTW} instance to use (default: {@link tw})
 * @param strings
 * @param interpolations
 * @returns the class name
 */
export const tx: TxFunction = function tx(
  this: ((tokens: string) => ComponentSheet) | undefined | void,
  strings: TemplateStringsArray | CSSValue,
  ...interpolations: CSSValue[]
): ComponentSheet {
  const tw = typeof this == 'function' ? this : tw$;
  return tw(interpolate(strings, interpolations))!;
};
