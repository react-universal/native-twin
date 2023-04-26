import { tx, tw, stringify } from '../client';

export function transformClassNames(...classes: string[]) {
  const generated = tx(...classes);
  const output = stringify(tw.target);
  tw.clear();
  return {
    target: tw.target,
    generated,
    css: output,
  };
}
