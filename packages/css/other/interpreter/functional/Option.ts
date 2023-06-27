export type Option<A> = Some<A> | None;

export interface Some<A> {
  readonly _tag: 'Some';
  readonly value: A;
}

export interface None {
  readonly _tag: 'None';
}

// Some impl
export const some = <A>(a: A): Option<A> => ({
  _tag: 'Some',
  value: a,
});

export const none: Option<never> = {
  _tag: 'None',
};

export const isNone = <A>(x: Option<A>): x is None => x._tag === 'None';

export const map: <A, B>(f: (a: A) => B) => (value: Option<A>) => Option<B> =
  (f) => (value) => {
    if (isNone(value)) {
      return value;
    }
    return some(f(value.value));
  };
