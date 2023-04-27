import { describe, expect, it } from 'vitest';
import { transformClassNames, tw } from '../src';

describe('TailwindCSS Position', () => {
  beforeEach(() => {
    tw.clear()
  })

  it('Right', () => {
    const { css } = transformClassNames('right-3');
    expect(css).toStrictEqual('/*!dbgidc,y,right-3*/.right-3{right}')
  });

  it('Left', () => {
    const { css } = transformClassNames('left-3');
    expect(css).toStrictEqual('/*!dbgidc,y,left-3*/.left-3{left}')
  });

  it('Top', () => {
    const { css } = transformClassNames('top-3');
    expect(css).toStrictEqual('/*!dbgidc,y,top-3*/.top-3{top}')
  });

  it('Bottom', () => {
    const { css } = transformClassNames('bottom-3');
    expect(css).toStrictEqual('/*!dbgidc,y,bottom-3*/.bottom-3{bottom}')
  });

  it('Inset', () => {
    const { css } = transformClassNames('inset-3');
    expect(css).toStrictEqual('/*!dbgidc,s,inset-3*/.inset-3{top;right;bottom;left}')
  });

  it('Negative Inset', () => {
    const { css } = transformClassNames('-inset-3');
    expect(css).toStrictEqual('/*!dbgidc,s,-inset-3*/.-inset-3{top;right;bottom;left}')
  });

  it('Inset Y', () => {
    const { css } = transformClassNames('inset-y-3');
    console.log(css)
    expect(css).toStrictEqual('/*!dbgidc,w,inset-y-3*/.inset-y-3{top;bottom}')
  });

  it('Negative Inset Y', () => {
    const { css } = transformClassNames('-inset-y-3');
    expect(css).toStrictEqual('/*!dbgidc,w,-inset-y-3*/.-inset-y-3{top;bottom}')
  });

  it('Negative Inset X', () => {
    const { css } = transformClassNames('-inset-x-3');
    expect(css).toStrictEqual('/*!dbgidc,w,-inset-x-3*/.-inset-x-3{right;left}')
  });

  it('Inset X', () => {
    const { css } = transformClassNames('inset-x-3');
    expect(css).toStrictEqual('/*!dbgidc,w,inset-x-3*/.inset-x-3{right;left}')
  });
});
