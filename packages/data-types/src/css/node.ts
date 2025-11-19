import {
  type Apply,
  type ApplyW,
  type Arg0,
  type Arg1,
  type Call1,
  type Call1W,
  Flow,
  type HKT,
  type Kind,
  type Params,
  Pipe,
  type TArg,
  type TolerantParams,
  type TolerantRetType,
  type TypeLambda,
  type TypeLambda1,
  type TypeLambdaG,
} from 'hkt-core';
import { Option } from '../internal';

interface MonadTypeClass<F extends HKT> {
  of: <T>(a: T) => Kind<F, T>; // Lift a value into the monad
  flatMap: <T, U>(fa: Kind<F, T>, f: (a: T) => Kind<F, U>) => Kind<F, U>;
}

// Create a `flatten` function for a monad from a monad type class
const createFlatten =
  <F extends HKT>(monad: MonadTypeClass<F>) =>
  <T>(ffa: Kind<F, Kind<F, T>>): Kind<F, T> =>
    monad.flatMap(ffa, (x) => x);

// const flattenArray = createFlatten(arrayMonad);

interface ArrayHKT extends HKT {
  return: Array<Arg0<this>>;
}
const arrayMonad: MonadTypeClass<ArrayHKT> = {
  of: (a) => [a],
  flatMap: (fa, f) => fa.flatMap(f),
};

interface OptionHKT extends HKT {
  return: Option.Option<Arg0<this>>;
}
const optionMonad: MonadTypeClass<OptionHKT> = {
  of: Option.some,
  flatMap: (fa, f) => (fa._tag === 'Some' ? f(fa.value) : Option.none),
};

optionMonad.flatMap(Option.some(Option.some(2)), (x) => x);

const flattenArray = createFlatten(arrayMonad);
// ^?
const flattenOption = createFlatten(optionMonad);
// ^?

interface Map extends TypeLambdaG<['T', 'U']> {
  signature: (
    f: TypeLambda<[x: TArg<this, 'T'>], TArg<this, 'U'>>,
    xs: TArg<this, 'T'>[],
  ) => TArg<this, 'U'>[];
  return: _Map<Arg0<this>, Arg1<this>>;
}
type _Map<F, TS> = { [K in keyof TS]: Call1W<F, TS[K]> };
// ^?

interface Append<Suffix extends string> extends TypeLambda<[s: string], string> {
  return: `${Arg0<this>}${Suffix}`;
}

type TolerantParamsOfMap = TolerantParams<Map>; // => [f: TypeLambda<[x: never], unknown>, xs: unknown[]]
type TolerantRetTypeOfMap = TolerantRetType<Map>; // => unknown[]


type MyApply<F extends TypeLambda, Args extends TolerantParams<F>> = ApplyW<F, Args>;
type _ = MyApply<Map, [Append<'baz'>, ['foo', 'bar']]>;