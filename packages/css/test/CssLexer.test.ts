import { describe, expect, it } from 'vitest';
// eslint-disable-next-line unused-imports/no-unused-imports
import { generateStylesFor, inspectTestElement } from './test-utils';

describe('@universal-labs/css - AT-RULES', () => {
  it('at-rule', () => {
    const result = generateStylesFor('text-2xl sm:text-base');
    // inspectTestElement('text-2xl sm:text-base', [], result);

    expect(result.base).toStrictEqual({
      fontSize: 16,
      lineHeight: 24,
    });
  });
});

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

  it('skew-x-1', () => {
    const result = generateStylesFor('skew-x-1');
    // inspectTestElement('skew-x-1', tw.target, result.base);
    expect(result.base).toStrictEqual({ transform: [{ skewX: '1deg' }] });
  });

  it('font-sans', () => {
    const result = generateStylesFor('font-sans');
    // inspectTestElement('text-2xl rotate-[1.2turn]', tw.target, result.base);
    expect(result.base).toStrictEqual({ fontFamily: 'ui-sans-serif' });
  });

  it('shadow', () => {
    const result = generateStylesFor('shadow-md');
    // inspectTestElement('shadow', tw.target, result);

    expect(result.base).toStrictEqual({
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 6,
      shadowOpacity: -1,
      shadowColor: 'rgba(0,0,0,0.1)',
    });
  });

  it('flex-1 aspect-square', () => {
    const result = generateStylesFor('flex-1 aspect-square');
    // inspectTestElement('flex-1', tw.target, result);

    expect(result.base).toStrictEqual({
      flexBasis: '0%',
      flexGrow: 1,
      flexShrink: 1,
      aspectRatio: 1,
    });
  });

  it('bg-gray-200', () => {
    const result = generateStylesFor('bg-gray-200');
    // inspectTestElement('bg-gray-200', tw.target, result);
    expect(result.base).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });

  it('-mt-2', () => {
    const result = generateStylesFor('-mt-2');
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ marginTop: -8 });
  });

  it('gap', () => {
    const result = generateStylesFor('gap-2 gap-x-2 gap-y-2');
    // inspectTestElement('gap-2', tw.target, result);

    expect(result.base).toStrictEqual({ gap: 8, columnGap: 8, rowGap: 8 });
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

  it('justify-center', () => {
    const result = generateStylesFor('justify-center');
    // inspectTestElement('justify-center', tw.target, result);

    expect(result.base).toStrictEqual({ justifyContent: 'center' });
  });

  it('hover:bg-gray-200', () => {
    const result = generateStylesFor('hover:bg-gray-200');
    // inspectTestElement('hover:bg-gray-200', tw.target, result);
    expect(result.pointer).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });

  it('first:bg-gray-200', () => {
    const result = generateStylesFor('first:bg-gray-200');
    // inspectTestElement('first:bg-gray-200', tw.target, result);

    expect(result.first).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });
});
