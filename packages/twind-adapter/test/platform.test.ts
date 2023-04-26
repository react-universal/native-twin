import { describe, expect, it } from 'vitest';
import { transformClassNames, tw } from '../src';

describe('TailwindCSS platform variants (web)', () => {
  beforeEach(() => {
    tw.clear()
  })

  it('Shadow', () => {
    const { css } = transformClassNames('web:rounded-xl ios:rounded-sm');
    console.log(css);
    expect(css).toStrictEqual('/*!dbjbi8,11,ios:rounded-sm*/.ios\\:rounded-sm:ios{border-radius}/*!dbjbi8,11,web:rounded-xl*/.web\\:rounded-xl:web{border-radius}')
  });
});
