import { describe, expect, it } from 'vitest';
import { defineConfig, setup, tx } from '../src';

setup(defineConfig({}));

describe('@universal-labs/native-tailwind - TW call', () => {
  it('Insert rules', () => {
    const result = tx`
    px-2 m-10 
    text(2xl indigo-200)
  `;
    expect(result.styles.finalSheet.base).toStrictEqual({
      color: 'rgba(199,210,254,1)',
      fontSize: 24,
      lineHeight: 32,
      paddingLeft: 8,
      paddingRight: 8,
      margin: 40,
    });
  });
});
