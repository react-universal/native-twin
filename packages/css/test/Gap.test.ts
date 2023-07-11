import { describe, expect, it } from 'vitest';
import { generateStylesFor } from './test-utils';

describe('@universal-labs/css Resular Rules', () => {
  it('gap', () => {
    const result = generateStylesFor('gap-2 gap-x-2 gap-y-2');
    // inspectTestElement('gap-2', tw.target, result);

    expect(result.base).toStrictEqual({ gap: 8, columnGap: 8, rowGap: 8 });
  });
});
