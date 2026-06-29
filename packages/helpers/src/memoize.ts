export function memoize<Result>(fn: (arg: string) => Result): (arg: string) => Result {
  const cache: Record<string, Result> = Object.create(null);

  return (arg: string) => {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}

export const weakMemoize = <Arg extends object, Return>(
  func: (arg: Arg) => Return,
): ((arg: Arg) => Return) => {
  const cache = new WeakMap<Arg, Return>();
  return (arg: Arg) => {
    if (cache.has(arg)) {
      // Use non-null assertion because we just checked that the cache `has` it
      // This allows us to remove `undefined` from the return value
      return cache.get(arg)!;
    }
    const ret = func(arg);
    cache.set(arg, ret);
    return ret;
  };
};
