import postcss from 'postcss';
import postcssJs from 'postcss-js';
import { assert, describe, it } from 'vitest';
import { tx, tw } from '../src/install';

// Edit an assertion and save to see HMR in action

describe('Tailwind Style Converter', () => {
  it('convert text-2xl', () => {
    tx('text-2xl flex-1 bg-gray-800');
    const root = postcss.parse(tw.target);
    const styleObject = postcssJs.objectify(root);
    const styles = JSON.stringify(root.toJSON());
    assert.deepEqual(JSON.parse(styles), styleObject, 'matches original');
  });
});
