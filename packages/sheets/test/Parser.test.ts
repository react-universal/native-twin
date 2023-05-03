import { describe, expect, it } from 'vitest';
import { VirtualStyleSheet } from '../src/stylesheet/VirtualStylesheet';

const virtualSheet = new VirtualStyleSheet();

describe('@universal-labs/stylesheets', () => {
  it('Extract Classes', () => {
    expect(virtualSheet.getClasses('flex-1 text(2xl white) bg-black')).toEqual([
      'flex-1',
      'text-2xl',
      'text-white',
      'bg-black',
    ]);
  });
});

// console.log('transformed', ast);
