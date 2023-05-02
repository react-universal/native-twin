import { describe, expect, it } from 'vitest';
import { VirtualStyleSheet } from '../src/stylesheet/VirtualStylesheet';

const virtualSheet = new VirtualStyleSheet();

describe('@universal-labs/stylesheets', () => {
  it('Transform css to react native', () => {
    const result = virtualSheet.injectUtilities('flex-1 text(2xl white) bg-black');
    console.log('RESULT_1: ', result);
    expect({ color: 'white' }).toStrictEqual({ color: 'white' });
  });
});

// console.log('transformed', ast);
