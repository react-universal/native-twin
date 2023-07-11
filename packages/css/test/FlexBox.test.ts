import { describe, expect, it, test } from 'vitest';
import { generateStylesFor } from './test-utils';

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
