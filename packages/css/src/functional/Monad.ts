import type { Functor } from './Functor';

export interface Monad<A> extends Functor<A> {}

const stack = new Map<string, any>();
