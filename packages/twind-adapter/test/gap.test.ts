import { describe, expect, it } from 'vitest';
import { setTailwindConfig, transformClassNames, tw } from '../src';

setTailwindConfig({});

describe('TailwindCSS GAP', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('gap', () => {
    const { css } = transformClassNames('gap-5');
    expect(css).toStrictEqual('/*!dbgidc,v,gap-5*/.gap-5{gap:20px}');
  });

  it('gap-x', () => {
    const { css } = transformClassNames('gap-x-5');
    expect(css).toStrictEqual('/*!dbgidc,y,gap-x-5*/.gap-x-5{column-gap:20px}');
  });

  it('gap-y', () => {
    const { css } = transformClassNames('gap-y-5');
    expect(css).toStrictEqual('/*!dbgidc,y,gap-y-5*/.gap-y-5{row-gap:20px}');
  });
});
