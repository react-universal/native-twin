import { describe, expect, it } from 'vitest';
import { transformClassNames, tw } from '../src';

describe('TailwindCSS GAP', () => {
  beforeEach(() => {
    tw.clear()
  })

  it('gap', () => {
    const { css } = transformClassNames('gap-5');
    expect(css).toStrictEqual('/*!dbgidc,v,gap-5*/.gap-5{gap}')
  });

  it('gap-x', () => {
    const { css } = transformClassNames('gap-x-5');
    expect(css).toStrictEqual('/*!dbgidc,y,gap-x-5*/.gap-x-5{column-gap}')
  });

  it('gap-y', () => {
    const { css } = transformClassNames('gap-y-5');
    expect(css).toStrictEqual('/*!dbgidc,y,gap-y-5*/.gap-y-5{row-gap}')
  });
});
