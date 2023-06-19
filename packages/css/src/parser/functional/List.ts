export type List<A> = Nil | Cons<A>;

export interface Nil {
  readonly _tag: 'Nil';
}

export interface Cons<A> {
  readonly _tag: 'Cons';
  readonly head: A;
  readonly tail: List<A>;
}

export const nil: List<never> = { _tag: 'Nil' };

export const cons = <A>(head: A, tail: List<A>): List<A> => ({
  _tag: 'Cons',
  head,
  tail,
});

const isNil = <A>(xs: List<A>): xs is Nil => xs._tag === 'Nil';

export type Show = <A>(xs: List<A>) => string;

export const show: Show = (xs) => {
  if (isNil(xs)) return '';
  return `${xs.head}${isNil(xs.tail) ? '' : `, ${show(xs.tail)}`}`;
};
