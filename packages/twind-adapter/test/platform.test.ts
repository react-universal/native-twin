import { describe, expect, it } from 'vitest';
import { setTailwindConfig, transformClassNames, tw } from '../src';

setTailwindConfig({});

describe('TailwindCSS platform variants (web)', () => {
  beforeEach(() => {
    tw.clear();
  });

  it('Shadow', () => {
    const { css } = transformClassNames('web:rounded-xl ios:rounded-sm');
    expect(css).toStrictEqual(
      '/*!efvqps,11,ios:rounded-sm*/@media (min-width::ios){.ios\\:rounded-sm{border-radius:2px}}/*!efvqps,11,web:rounded-xl*/@media (min-width::web){.web\\:rounded-xl{border-radius:12px}}',
    );
  });
});
