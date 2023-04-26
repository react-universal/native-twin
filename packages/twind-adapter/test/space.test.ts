import { describe, expect, it } from 'vitest';
import { transformClassNames, tw } from '../src';

describe('TailwindCSS Space', () => {
  beforeEach(() => {
    tw.clear()
  })

  it('Margin', () => {
    const { css } = transformClassNames('m-2');
    expect(css).toStrictEqual('/*!dbgidc,v,m-2*/.m-2{margin}')
  });

  it('Margin Top', () => {
    const { css } = transformClassNames('mt-2');
    expect(css).toStrictEqual('/*!dbgidc,y,mt-2*/.mt-2{margin-top}')
  });

  it('Space X', () => {
    const { css } = transformClassNames('space-y-2');
    expect(css).toStrictEqual('/*!dbgidc,u,space-y-2*/.space-y-2>:not([hidden])~:not([hidden]){--tw-space-y-reverse;margin-top;margin-bottom}')
  });

  it('Divide X', () => {
    const { css } = transformClassNames('divide-x-2');
    expect(css).toStrictEqual('/*!dbgidc,10,divide-x-2*/.divide-x-2>:not([hidden])~:not([hidden]){--tw-divide-x-reverse;border-left-width;border-right-width}')
  });
});
