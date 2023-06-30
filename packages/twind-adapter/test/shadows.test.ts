import { describe, expect, it } from 'vitest';
import { initialize } from '../src';

const { tx, tw } = initialize({});

describe('TailwindCSS Shadow', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Shadow', () => {
    tx('shadow-md');
    tx('shadow-sm');
    expect(tw.target).toStrictEqual([
      '.shadow-md{box-shadow:0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)}',
      '.shadow-sm{box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)}',
    ]);
  });

  it('Shadow', () => {
    tx('ring-1');
    expect(tw.target).toStrictEqual(['.ring-1{border:1px;margin:-1px}']);
  });
});
