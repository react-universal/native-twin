export function memoize<Result>(fn: (arg: string) => Result): (arg: string) => Result {
  const cache: Record<string, Result> = Object.create(null);

  return (arg: string) => {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}
