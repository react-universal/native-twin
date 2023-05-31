import { describe, expect, it } from 'vitest';
import { initialize, stringify } from '../src';

const { tx, tw } = initialize({});

describe('TailwindCSS rounded', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Shadow', () => {
    const className = tx('rounded-xl');
    expect(className).toStrictEqual('rounded-xl');
    expect(stringify(tw.target)).toStrictEqual('.rounded-xl{border-radius:12px}');
  });
});
