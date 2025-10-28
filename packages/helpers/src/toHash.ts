// Use WeakMap to store the object-key mapping so the objects can still be
/** biome-ignore-all lint/suspicious/noDoubleEquals: hack for hash */
/** biome-ignore-all lint/style/useTemplate: hack for hash */
// garbage collected. WeakMap uses a hashtable under the hood, so the lookup
// complexity is almost O(1).
const table = new WeakMap<object, string>();

let counter = 0;

export function stableHash(arg: any, debug = false): string {
  const type = typeof arg;
  const constructor = arg && arg.constructor;
  const isDate = constructor === Date;

  if (Object(arg) === arg && !isDate && constructor != RegExp) {
    // Object/function, not null/date/regexp. Use WeakMap to store the id first.
    // If it's already hashed, directly return the result.
    let result = table.get(arg);
    if (debug) {
      console.log('HASHED_CACHE: ', arg);
    }
    if (result) return result;
    // Store the hash first for circular reference detection before entering the
    // recursive `stableHash` calls.
    // For other objects like set and map, we use this id directly as the hash.
    result = ++counter + '~';
    table.set(arg, result);
    let index: any;

    if (constructor === Array) {
      // Array.
      result = '@';
      for (index = 0; index < arg.length; index++) {
        result += stableHash(arg[index], debug) + ',';
      }
      table.set(arg, result);
    } else if (constructor === Object) {
      // Object, sort keys.
      result = '#';
      const keys = Object.keys(arg).sort();
      while ((index = keys.pop() as string) !== undefined) {
        if (arg[index] !== undefined) {
          result += index + ':' + stableHash(arg[index], debug) + ',';
        }
      }
      table.set(arg, result);
    }
    return result;
  }
  if (isDate) return arg.toJSON();
  if (type === 'symbol') return arg.toString();
  return type === 'string' ? JSON.stringify(arg) : '' + arg;
}

// new FinalizationRegistry((cleanup) => {
//   console.log('CLEANING: ', cleanup);
// }).register(table, table);
