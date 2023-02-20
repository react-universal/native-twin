import { describe, expect, it } from 'vitest';
import { getCSS } from '../src';

describe('TWJ parser test', () => {
  it('transform opacity color', () => {
    const css = getCSS('bg-gray-900/80');
    expect(css).toContain('.bg-gray-900\\/80');
  });
});
