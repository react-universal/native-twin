import type { Functor } from './Functor';
import type { MonoID } from './MonoID';

export interface Monad<A> extends MonoID<A>, Functor<A> {}
