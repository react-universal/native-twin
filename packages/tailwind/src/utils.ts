import type { MaybeArray, ScreenValue } from './types';

/**
 * @internal
 */
export const escape =
  (typeof CSS !== 'undefined' && CSS.escape) ||
  // Simplified: escaping only special characters
  // Needed for NodeJS and Edge <79 (https://caniuse.com/mdn-api_css_escape)
  ((className: string): string =>
    className
      // Simplified escape testing only for chars that we know happen to be in tailwind directives
      .replace(/[!"'`*+.,;:\\/<=>?@#$%&^|~()[\]{}]/g, '\\$&')
      // If the character is the first character and is in the range [0-9] (2xl, ...)
      // https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
      .replace(/^\d/, '\\3$& '));

// Based on https://stackoverflow.com/a/52171480
/**
 * @group Configuration
 * @param value
 * @returns
 */
export function hash(value: string): string {
  for (var h = 9, index = value.length; index--; ) {
    h = Math.imul(h ^ value.charCodeAt(index), 0x5f356495);
  }

  return '#' + ((h ^ (h >>> 9)) >>> 0).toString(36);
}

/**
 * @internal
 * @param screen
 * @param prefix
 * @returns
 */
export function mql(screen: MaybeArray<ScreenValue>, prefix = '@media '): string {
  return (
    prefix +
    asArray(screen)
      .map((screen) => {
        if (typeof screen == 'string') {
          screen = { min: screen };
        }

        return (
          (screen as { raw?: string }).raw ||
          Object.keys(screen)
            .map(
              (feature) => `(${feature}-width:${(screen as Record<string, string>)[feature]})`,
            )
            .join(' and ')
        );
      })
      .join(',')
  );
}

/**
 * @internal
 * @param value
 * @returns
 */
export function asArray<T>(value: T = [] as unknown as T): T extends Array<any> ? T : T[] {
  return (Array.isArray(value) ? value : value == null ? [] : [value]) as T extends Array<any>
    ? T
    : T[];
}

/**
 * @internal
 * @param value
 * @returns
 */
export function identity<T>(value: T): T {
  return value;
}

/**
 * @internal
 */
export function noop(): void {
  // no-op
}
