import { describe, expect, it } from 'vitest';
import { initialize, stringify } from '../src';

const { tx, tw } = initialize({});

describe('TailwindCSS Shadow', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Shadow', () => {
    const className = tx('shadow-md');
    expect(className).toStrictEqual('shadow-md');
    expect(stringify(tw.target)).toStrictEqual(
      '*,::before,::after{--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000}::backdrop{--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000}.shadow-md{--tw-shadow-colored:0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);}',
    );
  });
});
