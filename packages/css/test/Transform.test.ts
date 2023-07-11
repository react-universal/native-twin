import { describe, expect, it } from 'vitest';
import { generateStylesFor } from './test-utils';

describe('@universal-labs/css Resular Rules', () => {
  it('skew-x-1', () => {
    const result = generateStylesFor('skew-x-1');
    // inspectTestElement('skew-x-1', tw.target, result.base);
    expect(result.base).toStrictEqual({ transform: [{ skewX: '1deg' }] });
  });

  it('translate-x-2', () => {
    const result = generateStylesFor('translate-x-2');
    // inspectTestElement('translate-x-2', tw.target, result);

    expect(result.base).toStrictEqual({ transform: [{ translateX: 8 }] });
  });

  it('translate-y-2', () => {
    const result = generateStylesFor('translate-y-2');
    // inspectTestElement('translate-y-2', tw.target, result);

    expect(result.base).toStrictEqual({ transform: [{ translateX: 0 }, { translateY: 32 }] });
  });

  it('-translate-y-2', () => {
    const result = generateStylesFor('-translate-y-2');
    // inspectTestElement('translate-y-2', tw.target, result);

    expect(result.base).toStrictEqual({ transform: [{ translateX: 0 }, { translateY: -32 }] });
  });
});
