import { tx, tw, stringify, setTailwindConfig } from './client';

export const parseObjectValuesAsStrings = (object: any) => {
  return Object.entries(object).reduce(
    (previous, [key, value]) => {
      if (typeof value === 'object') {
        Object.assign(previous, { [key]: parseObjectValuesAsStrings(value) });
      } else {
        Object.assign(previous, { [key]: String(value) });
      }
      return previous;
    },
    {} as {
      [key: string]: string;
    },
  );
};

export function transformClassNames(...classes: string[]) {
  tx(...classes);
  const output = stringify(tw.target);
  tw.clear();
  return output;
}

export { tw, tx, setTailwindConfig };
