import { initialize } from '@universal-labs/twind-adapter';
import { afterEach, describe, expect, it } from 'vitest';
import { CssResolver } from '../src/parser/css.resolver';

const { tx, tw } = initialize();

describe('@universal-labs/stylesheets', () => {
  afterEach(() => {
    tw.clear();
  });
  it('-mt-2', () => {
    tx('-mt-2');
    const result = tw.target.map(CssResolver);
    // inspectTestElement('-mt-2', tw.target, result);

    expect(result).toStrictEqual([
      {
        type: 'RULE',
        selector: { type: 'SELECTOR', value: '.-mt-2', group: 'base' },
        declarations: [
          {
            type: 'DECLARATION',
            property: 'margin-top',
            value: { type: 'DIMENSIONS', value: -0.5, units: 'rem' },
          },
        ],
      },
    ]);
  });
});
