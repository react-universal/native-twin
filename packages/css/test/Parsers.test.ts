import { describe, expect, it } from 'vitest';
import { ParseSelectorStrict } from '../src/css/selector-strict.parser';
import { getTestContext } from './test-utils';

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
      },
    });
  });
});
