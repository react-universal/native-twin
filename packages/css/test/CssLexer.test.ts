import { initialize } from '@universal-labs/twind-adapter';
import { afterEach, describe, expect, it } from 'vitest';
import { CssResolver } from '../src/parser/css.resolver';

// import { inspectTestElement } from './test-utils';

const { tx, tw } = initialize();

describe('@universal-labs/stylesheets', () => {
  afterEach(() => {
    tw.clear();
  });
  it('flex-1', () => {
    tx('flex-1');
    const result = CssResolver(tw.target);
    // inspectTestElement('flex-1', tw.target, result);

    expect(result).toStrictEqual({
      flexBasis: '0%',
      flexGrow: 1,
      flexShrink: 1,
    });
  });

  it('text-2xl', () => {
    tx('text-2xl');
    const result = CssResolver(tw.target);
    // inspectTestElement('text-2xl', tw.target, result);
    expect(result).toStrictEqual({ fontSize: 24, lineHeight: 32 });
  });

  it('bg-gray-200', () => {
    tx('bg-gray-200');
    const result = CssResolver(tw.target);
    // inspectTestElement('bg-gray-200', tw.target, result);
    expect(result).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });

  it('hover:bg-gray-200', () => {
    tx('hover:bg-gray-200');
    const result = CssResolver(tw.target);
    // inspectTestElement('hover:bg-gray-200', tw.target, result);
    expect(result).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });

  it('first:bg-gray-200', () => {
    tx('first:bg-gray-200');
    const result = CssResolver(tw.target);
    // inspectTestElement('first:bg-gray-200', tw.target, result);
    expect(result).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
  });

  it('-mt-2', () => {
    tx('-mt-2');
    const result = CssResolver(tw.target);
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result).toStrictEqual({ marginTop: -8 });
  });

  it('translate-x-2', () => {
    tx('translate-x-2');
    const result = CssResolver(tw.target);
    // inspectTestElement('translate-x-2', tw.target, result);

    expect(result).toStrictEqual({ transform: [{ translateX: 8 }] });
  });

  it('translate-y-2', () => {
    tx('translate-y-2');
    const result = CssResolver(tw.target);
    // inspectTestElement('translate-y-2', tw.target, result);

    expect(result).toStrictEqual({ transform: [{ translateX: 0 }, { translateY: 32 }] });
  });

  it('-translate-y-2', () => {
    tx('-translate-y-[10px]');
    const result = CssResolver(tw.target);
    // inspectTestElement('translate-y-2', tw.target, result);

    expect(result).toStrictEqual({ transform: [{ translateX: 0 }, { translateY: -10 }] });
  });

  it('justify-center', () => {
    tx('justify-center');
    const result = CssResolver(tw.target);
    // inspectTestElement('justify-center', tw.target, result);

    expect(result).toStrictEqual({ justifyContent: 'center' });
  });
});
