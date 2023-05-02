import { describe, expect, it } from 'vitest';
import { transformClassNames, tw } from '../src';

describe('TailwindCSS compiler', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Normal color', () => {
    const { css } = transformClassNames('bg-black');
    expect(css).toStrictEqual(
      '/*!dbgidc,w,bg-black*/.bg-black{--tw-bg-opacity;background-color}',
    );
  });

  it('Color with opacity', () => {
    const { css } = transformClassNames('bg-black/50');
    expect(css).toStrictEqual(
      '/*!dbgidc,w,bg-black/50*/.bg-black\\/50{--tw-bg-opacity;background-color}',
    );
  });

  it('Translations', () => {
    const { css } = transformClassNames('translate-x-8');
    expect(css).toStrictEqual('/*!dbgidc,v,translate-x-8*/.translate-x-8{transform}');
  });
});
