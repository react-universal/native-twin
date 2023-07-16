import { describe, expect, it } from 'vitest';
import { ParseSelectorStrict } from '../src/css/selector-strict.parser';
import { generateStylesFor, getTestContext } from './test-utils';

describe('@universal-labs/css - AT-RULES', () => {
  it('at-rule', () => {
    const result = generateStylesFor('text-2xl sm:text-base');

    expect(result.base).toStrictEqual({
      fontSize: 16,
      lineHeight: 24,
    });
  });
});

describe('@universal-labs/css Colors', () => {
  it('bg-gray-200 text-white', () => {
    const result = generateStylesFor('bg-gray-200 text-white');
    expect(result.base).toStrictEqual({
      backgroundColor: 'rgba(229,231,235,1)',
      color: 'rgba(255,255,255,1)',
    });
  });

  it('bg-gray-200', () => {
    const result = generateStylesFor('bg-gray-200');
    // inspectTestElement('bg-gray-200', tw.target, result);
    expect(result.base).toStrictEqual({ backgroundColor: 'rgba(229,231,235,1)' });
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

describe('CSS - FlexBox', () => {
  test('display flex', () => {
    const result = generateStylesFor('flex');

    expect(result.base).toStrictEqual({
      display: 'flex',
    });
  });

  test('display inline-flex :UNSUPPORTED:', () => {
    const result = generateStylesFor('inline-flex');
    expect(result.base).toStrictEqual({
      display: 'inline-flex',
    });
  });

  test('flex 1', () => {
    const result = generateStylesFor('flex-1');

    expect(result.base).toStrictEqual({
      flexBasis: '0%',
      flexGrow: 1,
      flexShrink: 1,
    });
  });

  test('flex direction row', () => {
    const flexRow = generateStylesFor('flex-row');

    expect(flexRow.base).toStrictEqual({
      flexDirection: 'row',
    });
  });

  test('flex direction row-reverse', () => {
    const flexRowReverse = generateStylesFor('flex-row-reverse');

    expect(flexRowReverse.base).toStrictEqual({
      flexDirection: 'row-reverse',
    });
  });

  test('flex direction col', () => {
    const flexCol = generateStylesFor('flex-col');

    expect(flexCol.base).toStrictEqual({
      flexDirection: 'column',
    });
  });

  test('flex direction col-reverse', () => {
    const flexColReverse = generateStylesFor('flex-col-reverse');

    expect(flexColReverse.base).toStrictEqual({
      flexDirection: 'column-reverse',
    });
  });

  test('flex wrap', () => {
    const flexWrap = generateStylesFor('flex-wrap');

    expect(flexWrap.base).toStrictEqual({
      flexWrap: 'wrap',
    });
  });

  test('flex wrap reverse', () => {
    const flexWrap = generateStylesFor('flex-wrap-reverse');

    expect(flexWrap.base).toStrictEqual({
      flexWrap: 'wrap-reverse',
    });
  });

  test('flex no wrap', () => {
    const flexWrap = generateStylesFor('flex-nowrap');

    expect(flexWrap.base).toStrictEqual({
      flexWrap: 'nowrap',
    });
  });

  test('flex auto :NOT_IMPLEMENTED:', () => {
    const flexWrap = generateStylesFor('flex-auto');

    expect(flexWrap.base).toStrictEqual({});
  });

  test('flex initial :NOT_IMPLEMENTED:', () => {
    const flex = generateStylesFor('flex-initial');

    expect(flex.base).toStrictEqual({});
  });

  test('flex none :NOT_IMPLEMENTED:', () => {
    const flex = generateStylesFor('flex-nonde');

    expect(flex.base).toStrictEqual({});
  });

  test('flex grow', () => {
    const flex = generateStylesFor('flex-grow');

    expect(flex.base).toStrictEqual({
      flexGrow: 1,
    });
  });

  test('flex shrink', () => {
    const flex = generateStylesFor('flex-shrink');

    expect(flex.base).toStrictEqual({
      flexShrink: 1,
    });
  });

  it('justify-center', () => {
    const result = generateStylesFor('justify-center');
    // inspectTestElement('justify-center', tw.target, result);

    expect(result.base).toStrictEqual({ justifyContent: 'center' });
  });
});

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

describe('@universal-labs/css Spaces', () => {
  it('-mt-2', () => {
    const result = generateStylesFor('-mt-2');
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ marginTop: -8 });
  });

  it('p-[1vw]', () => {
    const result = generateStylesFor('p-[1vw]');
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ padding: 7.2 });
  });

  it('aspect-square', () => {
    const result = generateStylesFor('aspect-square');
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ aspectRatio: 1 });
  });

  it('m-[10vh]', () => {
    const result = generateStylesFor('m-[10vh]');
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ margin: 128 });
  });

  it('mt-[10%]', () => {
    const result = generateStylesFor('mt-[10%]');
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result.base).toStrictEqual({ marginTop: '10%' });
  });
});

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

describe('@universal-labs/css GAP', () => {
  it('gap', () => {
    const result = generateStylesFor('gap-2 gap-x-2 gap-y-2');
    // inspectTestElement('gap-2', tw.target, result);

    expect(result.base).toStrictEqual({ gap: 8, columnGap: 8, rowGap: 8 });
  });
});

describe('@universal-labs/css Transform', () => {
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

  it('rotate-[1.2turn]', () => {
    const result = generateStylesFor('rotate-[1.2turn]');
    // inspectTestElement('skew-x-1', tw.target, result.base);
    expect(result.base).toStrictEqual({ transform: [{ rotate: '432deg' }] });
  });

  it('rotate-x-[10rad]', () => {
    const result = generateStylesFor('rotate-x-[10rad]');
    // inspectTestElement('skew-x-1', tw.target, result.base);
    expect(result.base).toStrictEqual({ transform: [{ rotate: '10rad' }] });
  });
});

const testContext = getTestContext();

const hoverCss = '.hover\\:bg-black:hover{background-color:rgba(0,0,0,1);}';

describe('@universal-labs/css Parsers', () => {
  it('Strict Selector', () => {
    const result = ParseSelectorStrict.run(hoverCss, testContext);
    expect(result).toStrictEqual({
      isError: false,
      result: {
        type: 'SELECTOR',
        value: {
          pseudoSelectors: ['hover'],
          selectorList: ['bg-black'],
          group: 'pointer',
        },
      },
      cursor: 22,
      data: {
        context: {
          deviceHeight: 1280,
          deviceWidth: 720,
          rem: 16,
          platform: 'ios',
        },
        styles: {
          base: {},
          even: {},
          first: {},
          group: {},
          last: {},
          odd: {},
          pointer: {},
        },
      },
    });
  });
});
