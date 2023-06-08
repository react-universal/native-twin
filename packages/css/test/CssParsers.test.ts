/* eslint-disable no-console */
import { initialize } from '@universal-labs/twind-adapter';
import util from 'util';
import { describe, expect, it } from 'vitest';
import { cssParser } from '../src/css.parser';

const { tx, tw } = initialize();

const getCssForutilities = (utilities: string) => {
  const restore = tw.snapshot();
  tx(utilities);
  const css = tw.target.join('');
  restore();
  return css;
};

describe('@universal-labs/stylesheets', () => {
  it('Css Rule Parser', () => {
    const css = getCssForutilities('text-2xl leading-6');

    const ruleAst = cssParser.run(css);
    console.group('Css translate rule Parser');
    console.log('CSS: ', css);
    console.log('LEXER: ', util.inspect(ruleAst, false, null, true));
    console.groupEnd();
    expect(ruleAst).toStrictEqual({
      isError: false,
      result: [
        {
          selector: '.text-2xl',
          declarations: [
            { property: 'font-size', value: { value: '1.5', unit: 'rem' } },
            { property: 'line-height', value: { value: '2', unit: 'rem' } },
          ],
        },
        {
          selector: '.leading-6',
          declarations: [
            {
              property: 'line-height',
              value: { value: '1.5', unit: 'rem' },
            },
          ],
        },
      ],
      index: 74,
      data: null,
    });
  });

  it('CSS: translate utilities parser', () => {
    const css = getCssForutilities('translate-x-2 translate-y-2');
    const ruleAst = cssParser.run(css);
    console.group('Css translate rule Parser');
    console.log('CSS: ', css);
    console.log('LEXER: ', util.inspect(ruleAst, false, null, true));
    console.groupEnd();
    expect(ruleAst).toStrictEqual({
      isError: false,
      result: [
        {
          selector: '.translate-x-2',
          declarations: [
            {
              property: 'transform',
              value: ['translate', '(', '0.5rem', ')'],
            },
          ],
        },
        {
          selector: '.translate-y-2',
          declarations: [
            {
              property: 'transform',
              value: ['translate', '(', '0, 2rem', ')'],
            },
          ],
        },
      ],
      index: 87,
      data: null,
    });
  });
});
