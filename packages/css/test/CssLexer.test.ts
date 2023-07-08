import { initialize } from '@universal-labs/twind-adapter';
import { afterEach, describe, expect, it } from 'vitest';
import { CssResolver } from '../src';
import { sheetManager } from '../src/data/SheetManager';
import { createParserContext } from '../src/parsers/Parser';
import { inspectTestElement } from './test-utils';

const { tx, tw } = initialize();
const { context } = createParserContext({
  deviceHeight: 1280,
  deviceWidth: 720,
  rem: 16,
  platform: 'ios',
});

const resolver = sheetManager(context);

describe('@universal-labs/css - AT-RULES', () => {
  afterEach(() => {
    tw.clear();
  });
  it('at-rule', () => {
    tx('text-2xl sm:text-base');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('text-2xl sm:text-base', tw.target, result);

    expect(result.base).toStrictEqual({
      fontSize: 16,
      lineHeight: 24,
    });
  });
});

describe('@universal-labs/css Resular Rules', () => {
  afterEach(() => {
    tw.clear();
  });

  it('text-2xl', () => {
    tx('text-2xl');
    const result = resolver.parse(tw.target[0]!);
    inspectTestElement('text-2xl rotate-[1.2turn]', tw.target, result);
    expect(result).toStrictEqual({
      selector: { group: 'base', value: '.text-2xl' },
      declarations: { fontSize: 24, lineHeight: 32 },
    });
  });

  it('text-2xl', () => {
    tx('text-2xl rotate-[1.2turn]');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('text-2xl rotate-[1.2turn]', tw.target, result.base);
    expect(result.base).toStrictEqual({
      fontSize: 24,
      lineHeight: 32,
      transform: [{ rotate: '432deg' }],
    });
  });

  it('skew-x-1', () => {
    tx('skew-x-1');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('skew-x-1', tw.target, result.base);
    expect(result.base).toStrictEqual({ transform: [{ skewX: '1deg' }] });
  });

  it('font-sans', () => {
    tx('font-sans');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('text-2xl rotate-[1.2turn]', tw.target, result.base);
    expect(result.base).toStrictEqual({ fontFamily: 'ui-sans-serif' });
  });

  it('shadow', () => {
    tx('shadow-md');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('shadow', tw.target, result);

    expect(result.base).toStrictEqual({
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 6,
      shadowOpacity: -1,
      shadowColor: 'rgba(0,0,0,0.1)',
    });
  });

  it('flex-1 aspect-square', () => {
    tx('flex-1 aspect-square');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('flex-1', tw.target, result);

    expect(result.base).toStrictEqual({
      flexBasis: '0%',
      flexGrow: 1,
      flexShrink: 1,
      aspectRatio: 1,
    });
  });

  it('bg-gray-200', () => {
    tx('bg-gray-200');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('bg-gray-200', tw.target, result);
    expect(result.base).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });

  it('-mt-2', () => {
    tx('-mt-2');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ marginTop: -8 });
  });

  it('translate-x-2', () => {
    tx('translate-x-2');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('translate-x-2', tw.target, result);

    expect(result.base).toStrictEqual({ transform: [{ translateX: 8 }] });
  });

  it('translate-y-2', () => {
    tx('translate-y-2');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('translate-y-2', tw.target, result);

    expect(result.base).toStrictEqual({ transform: [{ translateX: 0 }, { translateY: 32 }] });
  });

  it('-translate-y-2', () => {
    tx('-translate-y-2');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('translate-y-2', tw.target, result);

    expect(result.base).toStrictEqual({ transform: [{ translateX: 0 }, { translateY: -32 }] });
  });

  it('justify-center', () => {
    tx('justify-center');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('justify-center', tw.target, result);

    expect(result.base).toStrictEqual({ justifyContent: 'center' });
  });

  it('hover:bg-gray-200', () => {
    tx('hover:bg-gray-200');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('hover:bg-gray-200', tw.target, result);
    expect(result.pointer).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });

  it('first:bg-gray-200', () => {
    tx('first:bg-gray-200');
    const result = CssResolver(tw.target, context);
    // inspectTestElement('first:bg-gray-200', tw.target, result);

    expect(result.first).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });
});
