import { describe, expect, it } from 'vitest';
import { generateStylesFor } from './test-utils';

describe('@universal-labs/css - AT-RULES', () => {
  it('at-rule', () => {
    const result = generateStylesFor('text-2xl sm:text-base');

    expect(result.base).toStrictEqual({
      fontSize: 16,
      lineHeight: 24,
    });
  });
});
