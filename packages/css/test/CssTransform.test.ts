import { initialize } from '@universal-labs/twind-adapter';
import { afterEach, describe, expect, it } from 'vitest';
import { CssResolver } from '../src/parser/css.resolver';

const { tx, tw } = initialize();

describe('@universal-labs/stylesheets', () => {
  afterEach(() => {
    tw.clear();
  });
  it('translate-x-2', () => {
    tx('translate-x-2');
    const result = tw.target.map(CssResolver);
    // printResult('translate-x-2', tw.target, result);

    expect(result).toStrictEqual([
      {
        type: 'RULE',
        selector: { type: 'SELECTOR', value: '.translate-x-2', group: 'base' },
        declarations: [
          {
            type: 'DECLARATION',
            property: 'transform',
            value: {
              dimension: '2d',
              type: 'TRANSFORM',
              x: { type: 'DIMENSIONS', value: 0.5, units: 'rem' },
            },
          },
        ],
      },
    ]);
  });

  it('translate-y-2', () => {
    tx('translate-y-2');
    const result = tw.target.map(CssResolver);
    // printResult('translate-y-2', tw.target, result);

    expect(result).toStrictEqual([
      {
        type: 'RULE',
        selector: { type: 'SELECTOR', value: '.translate-y-2', group: 'base' },
        declarations: [
          {
            type: 'DECLARATION',
            property: 'transform',
            value: {
              dimension: '2d',
              type: 'TRANSFORM',
              x: { type: 'DIMENSIONS', value: 0, units: 'none' },
              y: { type: 'DIMENSIONS', value: 2, units: 'rem' },
            },
          },
        ],
      },
    ]);
  });

  it('-translate-y-2', () => {
    tx('-translate-y-[10px]');
    const result = tw.target.map(CssResolver);
    // printResult('translate-y-2', tw.target, result);

    expect(result).toStrictEqual([
      {
        type: 'RULE',
        selector: {
          type: 'SELECTOR',
          value: '.-translate-y-\\[10px\\]',
          group: 'base',
        },
        declarations: [
          {
            type: 'DECLARATION',
            property: 'transform',
            value: {
              dimension: '2d',
              type: 'TRANSFORM',
              x: { type: 'DIMENSIONS', value: 0, units: 'none' },
              y: { type: 'DIMENSIONS', value: -10, units: 'px' },
            },
          },
        ],
      },
    ]);
  });
});
