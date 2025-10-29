import type { Functor1 } from './Functor';

export type Task<A> = () => Promise<A>;

export const functor: Functor1<'Task'> = {
  URI: 'Task',
  map: (f) => (taskA) => () => taskA().then(f),
};
