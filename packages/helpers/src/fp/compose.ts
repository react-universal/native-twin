/**
 * Compose function: performs right-to-left function composition.
 * It is a function that takes two functions 'f' and 'g' and produces a function that,
 * for any input 'x', returns the result of applying 'f' to the result of applying 'g' to 'x'.
 * @type {Compose}
 * @param {function} f - The first function to apply.
 * @param {function} g - The second function to apply.
 * @returns {function} - A function that applies 'f' to the result of applying 'g' to its input.
 *
 * @example
 * ```typescript
 * const multiplyByTwo = (x: number): number => x * 2;
 * const addThree = (x: number): number => x + 3;
 * const composedFunction = compose(multiplyByTwo, addThree);
 * console.log(composedFunction(5)); // Output: 16
 * ```
 */
export type Compose = <A, B, C>(f: (x: B) => C, g: (x: A) => B) => (x: A) => C;

export const compose: Compose = (f, g) => (x) => f(g(x));
