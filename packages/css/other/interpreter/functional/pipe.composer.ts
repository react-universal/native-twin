/**
 * Pipe a set of functions in order following the lexical order
 * f(A): A => f(a, b): B => f(a, b, c): C =>... => E
 * @date 6/1/2023 - 11:18:09 PM
 *
 * @export
 * @template A
 */
export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
export function pipe<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D;
export function pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
): E;
export function pipe(
  a: unknown,
  ab?: Function,
  bc?: Function,
  cd?: Function,
  de?: Function,
): unknown {
  switch (arguments.length) {
    case 1:
      return a;
    case 2:
      return ab!(a);
    case 3:
      return bc!(ab!(a));
    case 4:
      return cd!(bc!(ab!(a)));
    case 5:
      return de!(cd!(bc!(ab!(a))));
    default: {
      let rest = arguments[0];
      for (let i = 1; i < arguments.length; i++) {
        rest = arguments[i](rest);
      }
      return rest;
    }
  }
}
