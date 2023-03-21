import { describe, expect, it } from 'vitest';
import { storeManager } from '../src';

describe('@universal-labs/stylesheets', () => {
  it('font-size', () => {
    const store = storeManager.getState().components.has('asd');
    expect(store).toStrictEqual(false);
  });
});
