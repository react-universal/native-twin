type Fn<Input, Output> = (i: Input) => Output;
type Pipe<Input, Output> = {
  pipe: <Output2>(fn: Fn<Output, Output2>) => Pipe<Input, Output2>;
  build: () => Fn<Input, Output>;
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

export const builder = pipeBuilder((x: number) => x)
  .pipe((x) => x * 2)
  .pipe((x) => `${x}`)
  .build();

builder(1); // ?
