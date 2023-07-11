import { describe, expect, it } from 'vitest';
import { generateStylesFor } from './test-utils';

describe('@universal-labs/css Resular Rules', () => {
  it('text-2xl', () => {
    const result = generateStylesFor('text-2xl');
    // inspectTestElement('text-2xl rotate-[1.2turn]', [], result);
    expect(result.base).toStrictEqual({ fontSize: 24, lineHeight: 32 });
  });

  it('text-2xl', () => {
    const result = generateStylesFor('text-2xl rotate-[1.2turn]');
    // inspectTestElement('text-2xl rotate-[1.2turn]', tw.target, result.base);
    expect(result.base).toStrictEqual({
      fontSize: 24,
      lineHeight: 32,
      transform: [{ rotate: '432deg' }],
    });
  });

  it('font-sans', () => {
    const result = generateStylesFor('font-sans');
    // inspectTestElement('text-2xl rotate-[1.2turn]', tw.target, result.base);
    expect(result.base).toStrictEqual({ fontFamily: 'ui-sans-serif' });
  });
});
