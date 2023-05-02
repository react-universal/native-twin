import { describe, expect, it } from 'vitest';
import { setTailwindConfig, transformClassNames, tw } from '../src';

setTailwindConfig({});

describe('TailwindCSS Position', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Right', () => {
    const { css } = transformClassNames('right-3');
    expect(css).toStrictEqual('/*!dbgidc,y,right-3*/.right-3{right:12px}');
  });

  it('Left', () => {
    const { css } = transformClassNames('left-3');
    expect(css).toStrictEqual('/*!dbgidc,y,left-3*/.left-3{left:12px}');
  });

  it('Top', () => {
    const { css } = transformClassNames('top-3');
    expect(css).toStrictEqual('/*!dbgidc,y,top-3*/.top-3{top:12px}');
  });

  it('Bottom', () => {
    const { css } = transformClassNames('bottom-3');
    expect(css).toStrictEqual('/*!dbgidc,y,bottom-3*/.bottom-3{bottom:12px}');
  });

  it('Inset', () => {
    const { css } = transformClassNames('inset-3');
    expect(css).toStrictEqual(
      '/*!dbgidc,s,inset-3*/.inset-3{top:12px;right:12px;bottom:12px;left:12px}',
    );
  });

  it('Negative Inset', () => {
    const { css } = transformClassNames('-inset-3');
    expect(css).toStrictEqual('/*!dbgidc,s,-inset-3*/.-inset-3{top:-12px}');
  });

  it('Inset Y', () => {
    const { css } = transformClassNames('inset-y-3');
    expect(css).toStrictEqual('/*!dbgidc,w,inset-y-3*/.inset-y-3{top:12px;bottom:12px}');
  });

  it('Negative Inset Y', () => {
    const { css } = transformClassNames('-inset-y-3');
    expect(css).toStrictEqual('/*!dbgidc,w,-inset-y-3*/.-inset-y-3{top:-12px}');
  });

  it('Negative Inset X', () => {
    const { css } = transformClassNames('-inset-x-3');
    expect(css).toStrictEqual('/*!dbgidc,w,-inset-x-3*/.-inset-x-3{right:-12px}');
  });

  it('Inset X', () => {
    const { css } = transformClassNames('inset-x-3');
    expect(css).toStrictEqual('/*!dbgidc,w,inset-x-3*/.inset-x-3{right:12px;left:12px}');
  });
});
