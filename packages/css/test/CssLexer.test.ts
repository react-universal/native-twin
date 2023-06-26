/* eslint-disable no-console */
import { initialize } from '@universal-labs/twind-adapter';
import util from 'util';
import { afterEach, describe, expect, it } from 'vitest';
import { CssResolver } from '../src/parser/css.resolver';

const { tx, tw } = initialize();

const printResult = (msg: string, target: string[], result: any) => {
  console.log(
    msg,
    util.inspect(
      {
        target,
        result,
      },
      false,
      null,
      true,
    ),
  );
};

describe('@universal-labs/stylesheets', () => {
  afterEach(() => {
    tw.clear();
  });
  it('flex-1', () => {
    tx('flex-1');
    const result = tw.target.map(CssResolver);
    // printResult('flex-1', tw.target, result);

    expect(result).toStrictEqual([
      {
        type: 'RULE',
        declarations: [
          {
            type: 'DECLARATION',
            property: 'flex',
            value: {
              flexBasis: { type: 'DIMENSIONS', value: 0, units: '%' },
              flexGrow: { type: 'DIMENSIONS', value: 1, units: 'none' },
              flexShrink: { type: 'DIMENSIONS', value: 1, units: 'none' },
              type: 'FLEX',
            },
          },
        ],
        selector: { type: 'SELECTOR', value: '.flex-1', group: 'base' },
      },
    ]);
  });

  it('text-2xl', () => {
    tx('text-2xl');
    const result = tw.target.map(CssResolver);
    // printResult('text-2xl', tw.target, result);
    expect(result).toStrictEqual([
      {
        type: 'RULE',
        selector: { type: 'SELECTOR', value: '.text-2xl', group: 'base' },
        declarations: [
          {
            type: 'DECLARATION',
            property: 'font-size',
            value: { type: 'DIMENSIONS', value: 1.5, units: 'rem' },
          },
          {
            type: 'DECLARATION',
            property: 'line-height',
            value: { type: 'DIMENSIONS', value: 2, units: 'rem' },
          },
        ],
      },
    ]);
  });

  it('bg-gray-200', () => {
    tx('bg-gray-200');
    const result = tw.target.map(CssResolver);
    // printResult('bg-gray-200', tw.target, result);
    expect(result).toStrictEqual([
      {
        type: 'RULE',
        selector: { type: 'SELECTOR', value: '.bg-gray-200', group: 'base' },
        declarations: [
          {
            type: 'DECLARATION',
            property: 'background-color',
            value: { type: 'RAW', value: 'rgba(229,231,235,1)' },
          },
        ],
      },
    ]);
  });

  it('hover:bg-gray-200', () => {
    tx('hover:bg-gray-200');
    const result = tw.target.map(CssResolver);
    printResult('hover:bg-gray-200', tw.target, result);
    expect(result).toStrictEqual([
      {
        type: 'RULE',
        selector: { type: 'SELECTOR', value: '.bg-gray-200', group: 'base' },
        declarations: [
          {
            type: 'DECLARATION',
            property: 'background-color',
            value: { type: 'RAW', value: 'rgba(229,231,235,1)' },
          },
        ],
      },
    ]);
  });
});
