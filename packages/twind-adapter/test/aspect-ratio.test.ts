import { describe, expect, it } from 'vitest';
import { setTailwindConfig, transformClassNames, tw } from '../src';

setTailwindConfig({
  fontFamily: {
    DEFAULT: 'Inter-Regular',
    inter: 'Inter-Regular',
    'inter-bold': 'Inter-Bold',
    'inter-medium': 'Inter-Medium',
    sans: 'Inter-Regular',
  },
});

describe('TailwindCSS Aspect Ratio', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('aspect-square', () => {
    const { css } = transformClassNames('aspect-square');
    expect(css).toStrictEqual('/*!dbgidc,y,aspect-square*/.aspect-square{aspect-ratio:1/1}');
  });

  it('aspect-video', () => {
    const { css } = transformClassNames('aspect-video');
    expect(css).toStrictEqual('/*!dbgidc,y,aspect-video*/.aspect-video{aspect-ratio:16/9}');
  });

  it('aspect-auto', () => {
    const { css } = transformClassNames('aspect-auto');
    expect(css).toStrictEqual('/*!dbgidc,y,aspect-auto*/.aspect-auto{aspect-ratio:auto}');
  });
});
