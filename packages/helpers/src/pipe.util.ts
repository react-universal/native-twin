type Fn<Input, Output> = (i: Input) => Output;
type Pipe<Input, Output> = {
  pipe: <Output2>(fn: Fn<Output, Output2>) => Pipe<Input, Output2>;
  build: () => Fn<Input, Output>;
};

const Box = <A>(x: A) => {
  return {
    map: <B>(fnx: (x: A) => B) => Box(fnx(x)),
    fold: () => x,
    toString: () => `Box(${x})`,
    flatMap: <B>(fnx: (x: A) => B) => fnx(x),
  };
};

export function pipeBuilder<Input, Output>(fn: Fn<Input, Output>): Pipe<Input, Output> {
  const fns: Fn<any, any>[] = [fn];
  const p: Pipe<any, any> = {
    pipe: (fn) => {
      fns.push(fn);
      return p;
    },
    build: () => {
      return (input) => fns.reduce((prev, curr) => curr(prev), input);
    },
  };
  return p;
}
