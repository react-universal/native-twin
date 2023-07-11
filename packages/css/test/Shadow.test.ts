import { describe, expect, test } from 'vitest';
import { generateStylesFor } from './test-utils';

describe('CSS - Shadow', () => {
  test('shadow', () => {
    const result = generateStylesFor('shadow-md');
    // inspectTestElement('shadow', tw.target, result);

    expect(result.base).toStrictEqual({
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 6,
      shadowOpacity: -1,
      shadowColor: 'rgba(0,0,0,0.1)',
    });
  });
});
