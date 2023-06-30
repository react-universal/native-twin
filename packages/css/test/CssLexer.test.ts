import { initialize } from '@universal-labs/twind-adapter';
import { afterEach, describe, expect, it } from 'vitest';
import { CssResolver } from '../src/parser/css.resolver';
import { inspectTestElement } from './test-utils';

const { tx, tw } = initialize();
const defaultConfig = {
  deviceHeight: 1280,
  deviceWidth: 720,
  rem: 16,
};

describe('@universal-labs/stylesheets', () => {
  afterEach(() => {
    tw.clear();
  });

  it('shadow', () => {
    tx('shadow-md');
    const result = CssResolver(tw.target, defaultConfig);
    inspectTestElement('shadow', tw.target, result);

    expect(result.base).toStrictEqual({
      boxShadow: undefined,
    });
  });

  it('at-rule', () => {
    tx('text-2xl sm:text-base');
    const result = CssResolver(tw.target, defaultConfig);
    // inspectTestElement('flex-1', tw.target, result);

    expect(result.base).toStrictEqual({
      fontSize: 16,
      lineHeight: 24,
    });
  });

  it('flex-1', () => {
    tx('flex-1');
    const result = CssResolver(tw.target, defaultConfig);
    // inspectTestElement('flex-1', tw.target, result);

    expect(result.base).toStrictEqual({
      flexBasis: '0%',
      flexGrow: 1,
      flexShrink: 1,
    });
  });
  // Array;
  it('text-2xl', () => {
    tx('text-2xl');
    const result = CssResolver(tw.target, defaultConfig);
    // inspectTestElement('text-2xl', tw.target, result);
    expect(result.base).toStrictEqual({ fontSize: 24, lineHeight: 32 });
  });

  it('bg-gray-200', () => {
    tx('bg-gray-200');
    const result = CssResolver(tw.target, defaultConfig);
    // inspectTestElement('bg-gray-200', tw.target, result);
    expect(result.base).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });

  it('hover:bg-gray-200', () => {
    tx('hover:bg-gray-200');
    const result = CssResolver(tw.target, defaultConfig);
    // inspectTestElement('hover:bg-gray-200', tw.target, result);
    expect(result.pointer).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });

  it('first:bg-gray-200', () => {
    tx('first:bg-gray-200');
    const result = CssResolver(tw.target, defaultConfig);
    // inspectTestElement('first:bg-gray-200', tw.target, result);

    expect(result.first).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });

  it('-mt-2', () => {
    tx('-mt-2');
    const result = CssResolver(tw.target, defaultConfig);
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ marginTop: -8 });
  });

  it('translate-x-2', () => {
    tx('translate-x-2');
    const result = CssResolver(tw.target, defaultConfig);
    // inspectTestElement('translate-x-2', tw.target, result);

    expect(result.base).toStrictEqual({ transform: [{ translateX: 8 }] });
  });

  it('translate-y-2', () => {
    tx('translate-y-2');
    const result = CssResolver(tw.target, defaultConfig);
    // inspectTestElement('translate-y-2', tw.target, result);

    expect(result.base).toStrictEqual({ transform: [{ translateX: 0 }, { translateY: 32 }] });
  });

  it('-translate-y-2', () => {
    tx('-translate-y-2');
    const result = CssResolver(tw.target, defaultConfig);
    // inspectTestElement('translate-y-2', tw.target, result);

    expect(result.base).toStrictEqual({ transform: [{ translateX: 0 }, { translateY: -32 }] });
  });

  it('justify-center', () => {
    tx('justify-center');
    const result = CssResolver(tw.target, defaultConfig);
    // inspectTestElement('justify-center', tw.target, result);

    expect(result.base).toStrictEqual({ justifyContent: 'center' });
  });
});
