import { beforeEach, describe, expect, it } from 'vitest';
import { initialize } from '../src';

const { tw, tx } = initialize({});
const stringify = (target: string[]) => target.join('');

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
