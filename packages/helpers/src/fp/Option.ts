import type { Bifunctor1 } from './Bifunctor';
import type { Functor1 } from './Functor';

export type Option<A> = Some<A> | None;

export interface Some<A> {
  _tag: 'Some';
  value: A;
}

export interface None {
  _tag: 'None';
}

export const some = <A>(x: A): Option<A> => ({ _tag: 'Some', value: x });

export const none: Option<never> = { _tag: 'None' };

export const isNone = <A>(x: Option<A>): x is None => x._tag === 'None';

export type Match = <A, B>(onNone: () => B, onSome: (a: A) => B) => (x: Option<A>) => B;

/**
 *
 * A => A
 * f: number => string
 * Option<number>;
 * Match Option<f(number)> =>  Option<string>
 */ 
export type MatchW = <A, B, C>(onNone: () => B, onSome: (a: A) => C) => (x: Option<A>) => B | C;

export const match: Match = (onNone, onSome) => (x) => (isNone(x) ? onNone() : onSome(x.value));

export const matchW: MatchW = (onNone, onSome) => (x) => (isNone(x) ? onNone() : onSome(x.value));

export type Map = <A, B>(f: (x: A) => B) => (Fx: Option<A>) => Option<B>;

export const map: Map = (f) =>
  match(
    () => none,
    (value) => some(f(value)),
  );

// const maybeNumber = none; // ?

// const maybeNumberToString = map((x: number): string => `${x}`);

// const result = maybeNumberToString(maybeNumber); // ?
export const functor: Functor1<'Option'> = {
  URI: 'Option',
  map,
};

export const bifunctor: Bifunctor1<'Option'> = {
  URI: 'Option',
  bimap: (f) =>
    match(
      () => none,
      (x) => some(f(x)),
    ),
};

// bifunctor.bimap((x: number) => x > 0)(some(1));

// const maybeNumber = some(1);

// const mapNumbers = map((x: number) => x + 1);
// const maybeNumberNone = none;

// console.log(mapNumbers(maybeNumber));

// console.log(maybeNumberNone);

// const matchNumber = match(
//   () => 0,
//   (a: number) => a + 1,
// );

// const a = matchNumber(maybeNumberNone);
// console.log(a);

// console.log('MATCH_NUMBER: ', matchNumber);

// const matchNumberW = matchW(
//   () => -2,
//   (a) => `Number is ${a}`,
// )(maybeNumberNone);

// // console.log('MATCH_NUMBER: ', matchNumberW);
