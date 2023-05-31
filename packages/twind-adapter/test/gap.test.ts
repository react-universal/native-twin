import { describe, expect, it } from 'vitest';
import { initialize, stringify } from '../src';

const { tw, tx } = initialize({});

describe('TailwindCSS GAP', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('gap', () => {
    const classNames = tx('gap-5');
    expect(classNames).toStrictEqual('gap-5');
    expect(stringify(tw.target)).toStrictEqual('.gap-5{gap:20px}');
  });

  it('gap-x', () => {
    const classNames = tx('gap-x-5');
    expect(classNames).toStrictEqual('gap-x-5');
    expect(stringify(tw.target)).toStrictEqual('.gap-x-5{column-gap:20px}');
  });

  it('gap-y', () => {
    const classNames = tx('gap-y-5');
    expect(classNames).toStrictEqual('gap-y-5');
    expect(stringify(tw.target)).toStrictEqual('.gap-y-5{row-gap:20px}');
  });
});
