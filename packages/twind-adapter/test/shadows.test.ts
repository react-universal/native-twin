import { describe, expect, it } from 'vitest';
import { transformClassNames, tw } from '../src';

describe('TailwindCSS Shadow', () => {
  beforeEach(() => {
    tw.clear()
  })

  it('Shadow', () => {
    const { css } = transformClassNames('shadow-md');
    expect(css).toStrictEqual('/*!0,1v*/*,::before,::after{--tw-ring-offset-shadow;--tw-ring-shadow;--tw-shadow;--tw-shadow-colored}/*!0,1v*/::backdrop{--tw-ring-offset-shadow;--tw-ring-shadow;--tw-shadow;--tw-shadow-colored}/*!dbgidc,u,shadow-md*/.shadow-md{--tw-shadow;--tw-shadow-colored;box-shadow}')
  });
});
