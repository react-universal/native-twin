import { describe, expect, it } from 'vitest';
import { generateStylesFor } from './test-utils';

describe('@universal-labs/css Resular Rules', () => {
  it('-mt-2', () => {
    const result = generateStylesFor('-mt-2');
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ marginTop: -8 });
  });

  it('p-[1vw]', () => {
    const result = generateStylesFor('p-[1vw]');
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ padding: 7.2 });
  });

  it('aspect-square', () => {
    const result = generateStylesFor('aspect-square');
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ aspectRatio: 1 });
  });

  it('m-[10vh]', () => {
    const result = generateStylesFor('m-[10vh]');
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ margin: 128 });
  });

  it('mt-[10%]', () => {
    const result = generateStylesFor('mt-[10%]');
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ marginTop: '10%' });
  });
});
