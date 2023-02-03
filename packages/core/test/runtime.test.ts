import postcss from 'postcss';
import postcssJs from 'postcss-js';
import { assert, describe, it } from 'vitest';
import { twind } from '../src/runtime';

// Edit an assertion and save to see HMR in action

describe('Tailwind Style Converter', () => {
  it('convert text-2xl', () => {
    const getStyles = twind('text-2xl');

    const root = postcss.parse(getStyles.style);
    const styleObject = postcssJs.objectify(root);
    const styles = JSON.stringify(styleObject);
    assert.deepEqual(JSON.parse(styles), styleObject, 'matches original');
  });
});
