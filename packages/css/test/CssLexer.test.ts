/* eslint-disable no-console */
import { initialize } from '@universal-labs/twind-adapter';
import util from 'util';
import { afterEach, describe, expect, it } from 'vitest';
import { CssResolver } from '../src/parser-fn/css.resolver';

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
    printResult('flex-1', tw.target, result);

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
    printResult('text-2xl', tw.target, result);
    expect(result).toStrictEqual([
      {
        type: 'RULE',
        selector: { type: 'SELECTOR', value: '.text-2xl', group: 'base' },
        declarations: [
          {
            type: 'DECLARATION',
            property: 'font-size',
            value: {
              flexBasis: { type: 'DIMENSIONS', units: '%', value: 1 },
              flexGrow: { type: 'DIMENSIONS', value: 1.5, units: 'rem' },
              flexShrink: { type: 'DIMENSIONS', units: 'none', value: 1 },
              type: 'FLEX',
            },
          },
          {
            type: 'DECLARATION',
            property: 'line-height',
            value: {
              flexBasis: { type: 'DIMENSIONS', units: '%', value: 1 },
              flexGrow: { type: 'DIMENSIONS', value: 2, units: 'rem' },
              flexShrink: { type: 'DIMENSIONS', units: 'none', value: 1 },
              type: 'FLEX',
            },
          },
        ],
      },
    ]);
  });
});
