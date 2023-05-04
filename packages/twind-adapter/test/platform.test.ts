import { describe, expect, it } from 'vitest';
import { initialize, stringify } from '../src';

const { tw, tx } = initialize({});

describe('TailwindCSS platform variants (web)', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Shadow', () => {
    const classNames = tx('web:rounded-xl ios:rounded-sm');
    expect(classNames).toStrictEqual('ios:rounded-sm web:rounded-xl');
    expect(stringify(tw.target)).toBeDefined();
  });
});
