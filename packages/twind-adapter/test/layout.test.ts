import { describe, expect, it } from 'vitest';
import { transformClassNames, tw } from '../src';

describe('TailwindCSS layout', () => {
  beforeEach(() => {
    tw.clear()
  })

  it('Width', () => {
    const { css } = transformClassNames('w-4');
    expect(css).toStrictEqual('/*!dbgidc,v,w-4*/.w-4{width}')
  });

  it('Height', () => {
    const { css } = transformClassNames('h-4');
    expect(css).toStrictEqual('/*!dbgidc,v,h-4*/.h-4{height}')
  });
});
