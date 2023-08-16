export interface Left<E> {
  readonly _tag: 'Left';
  readonly left: E;
}

export interface Right<A> {
  readonly _tag: 'Right';
  readonly right: A;
}

export type Either<E, A> = Left<E> | Right<A>;

export const isLeft = <E, A>(x: Either<E, A>): x is Left<E> => x._tag === 'Left';

export const left = <E, A = never>(e: E): Either<E, A> => ({
  _tag: 'Left',
  left: e,
});

export const right = <A, E = never>(a: A): Either<E, A> => ({
  _tag: 'Right',
  right: a,
});

export const of: <E = never, A = never>(a: A) => Either<E, A> = right;

export const map: <A, B>(f: (a: A) => B) => <E>(fa: Either<E, A>) => Either<E, B> =
  (f) => (fa) =>
    isLeft(fa) ? fa : right(f(fa.right));
