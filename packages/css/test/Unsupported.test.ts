import { describe, expect, it } from 'vitest';
import { generateStylesFor } from './test-utils';

describe.skip('@universal-labs/css - Unsupported', () => {
  it('Grid', () => {
    const result = generateStylesFor(
      'grid-cols-1 col-span-1 row-span-2 auto-cols-min auto-rows-min',
      true,
    );
    expect(result).toStrictEqual({});
  });
});
