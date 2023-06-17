import type { Monad } from './functional/Monad';

interface CssNode<A, B extends string> extends Monad<A> {
  type: B;
  value: A;
}

export const CssNodeOf = <A, Type extends string>(type: Type, value: A): CssNode<A, Type> => ({
  type,
  value,
  map: (f) => CssNodeOf(type, f(value)),
  empty: value,
  concat: (x, y) => value,
});
