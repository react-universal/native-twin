import { describe, expect, it } from 'vitest';
import { transformClassNames, tw } from '../src';

describe('TailwindCSS rounded', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Shadow', () => {
    const { css } = transformClassNames('rounded-xl');
    expect(css).toStrictEqual('/*!dbgidc,11,rounded-xl*/.rounded-xl{border-radius}');
  });
});
