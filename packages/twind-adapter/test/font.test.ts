import { beforeEach, describe, expect, it } from 'vitest';
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

describe('TailwindCSS Font', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('font-size', () => {
    const { css } = transformClassNames('text-2xl');
    expect(css).toStrictEqual(
      '/*!dbgidc,w,text-2xl*/.text-2xl{font-size:24px;line-height:32px}',
    );
  });

  it('font-family', () => {
    const { css } = transformClassNames('font-inter');
    expect(css).toStrictEqual(
      '/*!dbgidc,y,font-inter*/.font-inter{font-family:Inter-Regular}',
    );
  });

  it('leading', () => {
    const { css } = transformClassNames('leading-5');
    expect(css).toStrictEqual('/*!dbgidc,y,leading-5*/.leading-5{line-height:20px}');
  });
});
