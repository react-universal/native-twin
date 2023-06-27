import { initialize } from '@universal-labs/twind-adapter';
import { afterEach, describe, expect, it } from 'vitest';
import { CssResolver } from '../src/parser/css.resolver';
import { inspectTestElement } from './test-utils';

const { tx, tw } = initialize();

describe('@universal-labs/stylesheets', () => {
  afterEach(() => {
    tw.clear();
  });
  it('justify-center', () => {
    tx('justify-center');
    const result = tw.target.map(CssResolver);
    inspectTestElement('justify-center', tw.target, result);

    expect(result).toStrictEqual([
      {
        type: 'RULE',
        selector: { type: 'SELECTOR', value: '.justify-center', group: 'base' },
        declarations: [
          {
            type: 'DECLARATION',
            property: 'justify-content',
            value: { type: 'RAW', value: 'center' },
          },
        ],
      },
    ]);
  });
});
