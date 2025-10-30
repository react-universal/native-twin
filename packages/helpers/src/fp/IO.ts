import { compose } from './compose';
import type { Functor1 } from './Functor';

export type IO<A> = () => A;

export const functor: Functor1<'IO'> = {
  URI: 'IO',
  map: (f) => (ioA) => compose(f, ioA),
};

// const randomA: IO<number> = () => Math.random();

// const programa = functor.map(randomA)(() => 1)

