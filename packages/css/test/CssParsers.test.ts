import { initialize } from '@universal-labs/twind-adapter';
import { describe, expect, it } from 'vitest';
import { createCssParser } from '../src/css.parser';

const cssParser = createCssParser({ deviceHeight: 500, deviceWidth: 200, rem: 16 });
const { tx, tw } = initialize();

const utilitiesToAst = (utilities: string) => {
  const restore = tw.snapshot();
  tx(utilities);
  const css = tw.target.join('');
  restore();
  const ast = cssParser.tokenizeCss([css]);
  if (ast.isError) {
    throw new Error(`This utility crash the parser: ${utilities}`);
  }
  return ast.result.rules;
};

describe('@universal-labs/stylesheets', () => {
  it('Text Parsers', () => {
    const testTextSize = utilitiesToAst('text-2xl');

    expect(testTextSize).toStrictEqual([
      {
        type: 'rule',
        selector: '.text-2xl',
        declarations: [
          {
            type: 'declaration',
            property: 'font-size',
            value: { type: 'dimensions', value: '1.5', unit: 'rem' },
          },
          {
            type: 'declaration',
            property: 'line-height',
            value: { type: 'dimensions', value: '2', unit: 'rem' },
          },
        ],
      },
    ]);

    const testLeading = utilitiesToAst('leading-6');

    expect(testLeading).toStrictEqual([
      {
        type: 'rule',
        selector: '.leading-6',
        declarations: [
          {
            type: 'declaration',
            property: 'line-height',
            value: { type: 'dimensions', value: '1.5', unit: 'rem' },
          },
        ],
      },
    ]);
  });

  it('CSS: translate utilities parser', () => {
    const testTranslateXY = utilitiesToAst('translate-x-2 translate-y-2');

    expect(testTranslateXY).toStrictEqual([
      {
        type: 'rule',
        selector: '.translate-x-2',
        declarations: [
          {
            type: 'declaration',
            property: 'transform',
            value: {
              dimension: '2d',
              type: 'transform',
              x: { type: 'dimensions', value: '0.5', unit: 'rem' },
            },
          },
        ],
      },
      {
        type: 'rule',
        selector: '.translate-y-2',
        declarations: [
          {
            type: 'declaration',
            property: 'transform',
            value: {
              dimension: '2d',
              type: 'transform',
              x: { value: '0', type: 'dimensions', unit: 'none' },
              y: { type: 'dimensions', value: '2', unit: 'rem' },
            },
          },
        ],
      },
    ]);
  });
});
