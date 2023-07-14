import { describe, expect, it } from 'vitest';
import { ParseSelectorStrict } from '../src/css/selector-strict.parser';
import { ParseCssSelector } from '../src/css/selector.parser';
import { getTestContext, inspectTestElement } from './test-utils';

const testContext = getTestContext();

const hoverCss = '.hover\\:bg-black:hover{background-color:rgba(0,0,0,1);}';

describe('@universal-labs/css Parsers', () => {
  it('Raw Selector', () => {
    const result = ParseCssSelector.run(hoverCss, testContext);
    // inspectTestElement('Selector: ', css, result);
    expect(result).toStrictEqual({
      isError: false,
      result: { group: 'pointer', value: '.hover\\:bg-black:hover' },
      cursor: 22,
      data: {
        context: {
          deviceHeight: 1280,
          deviceWidth: 720,
          rem: 16,
          platform: 'ios',
        },
        seen: { selectors: new Set(), styles: {} },
      },
    });
  });

  it('Strict Selector', () => {
    const result = ParseSelectorStrict.run(hoverCss, testContext);
    inspectTestElement('Selector: ', [hoverCss], result);
    expect(result).toStrictEqual({
      isError: false,
      result: {
        type: 'SELECTOR',
        value: {
          pseudoSelectors: ['hover', 'hover'],
          selectorList: ['bg-black'],
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
        seen: { selectors: new Set(), styles: {} },
      },
    });
  });
});
