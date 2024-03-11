/**
 * A no-operation function, does nothing.
 * @example
 * noop();
 */
export function noop(): void {}

/**
 * Creates a duplicate-free version of an array.
 * @param {T[]} value - The array to inspect.
 * @returns {T[]} Returns the new duplicate free array.
 * @example
 * uniq([2, 1, 2]); // => [2, 1]
 */
export function uniq<T>(value: T[]): T[] {
  return Array.from(new Set(value));
}

/**
 * Checks if `value` is classified as a `string` type.
 * @param {*} s - The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 * isString('abc'); // => true
 * isString(1); // => false
 */
export function isString(s: any): s is string {
  return typeof s === 'string';
}

/**
 * Checks if `value` is the language type of `Object`.
 * @param {*} item - The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 * isObject({}); // => true
 * isObject([1, 2, 3]); // => false
 */
export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * A reference to the `hasOwnProperty` method from a plain object.
 * @example
 * hasOwnProperty.call(object, key);
 */
export const hasOwnProperty = {}.hasOwnProperty;
