import type { Functor1 } from './Functor';

export type Task<A> = () => Promise<A>;

export const functor: Functor1<'Task'> = {
  URI: 'Task',
  map: (f) => (taskA) => () => taskA().then(f),
};

// const testPromise: Task<number> = () => new Promise<number>((r) => r(Math.random()));
// const consoleLogTask = functor.map(console.log); // ?

// const program = consoleLogTask(testPromise);
// program();
