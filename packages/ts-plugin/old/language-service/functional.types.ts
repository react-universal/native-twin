type Fn<T, U> = (i: T) => U;
type Pipe<T, U> = { f: <K>(fn: Fn<U, K>) => Pipe<T, K>; build: () => Fn<T, U> };

export function pipe<T, U>(fn: Fn<T, U>): Pipe<T, U> {
  const fns: Fn<any, any>[] = [fn];
  const p: Pipe<any, any> = {
    f: (fn) => {
      fns.push(fn);
      return p;
    },
    build: () => {
      return (input) => fns.reduce((prev, curr) => curr(prev), input);
    },
  };
  return p;
}
