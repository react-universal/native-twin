import { describe, expect, it } from 'vitest';
import { generateStylesFor } from './test-utils';

describe('@universal-labs/css Font', () => {
  it('text-2xl', () => {
    const result = generateStylesFor('text-2xl');
    // inspectTestElement('text-2xl rotate-[1.2turn]', [], result);
    expect(result.base).toStrictEqual({ fontSize: 24, lineHeight: 32 });
  });

  it('text-2xl', () => {
    const result = generateStylesFor('text-2xl');
    // inspectTestElement('text-2xl rotate-[1.2turn]', tw.target, result.base);
    expect(result.base).toStrictEqual({
      fontSize: 24,
      lineHeight: 32,
    });
  });

  it('text-[2in]', () => {
    const result = generateStylesFor('text-[2in]');
    expect(result.base).toStrictEqual({
      fontSize: 192,
    });
  });

  it('text-[2cm]', () => {
    const result = generateStylesFor('text-[2cm]');
    // inspectTestElement('text-2xl rotate-[1.2turn]', tw.target, result.base);
    expect(result.base).toStrictEqual({
      fontSize: 195.6,
    });
  });

  it('text-[2mm]', () => {
    const result = generateStylesFor('text-[2mm]');
    // inspectTestElement('text-2xl rotate-[1.2turn]', tw.target, result.base);
    expect(result.base).toStrictEqual({
      fontSize: 19.56,
    });
  });

  it('text-[2pt]', () => {
    const result = generateStylesFor('text-[2pt]');
    // inspectTestElement('text-2xl rotate-[1.2turn]', tw.target, result.base);
    expect(result.base).toStrictEqual({
      fontSize: 2.6666666666666665,
    });
  });

  it('font-sans', () => {
    const result = generateStylesFor('font-sans');
    // inspectTestElement('text-2xl rotate-[1.2turn]', tw.target, result.base);
    expect(result.base).toStrictEqual({ fontFamily: 'ui-sans-serif' });
  });
});
