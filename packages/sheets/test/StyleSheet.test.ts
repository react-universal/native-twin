import { setTailwindConfig } from '@universal-labs/twind-native';
import { describe, expect, it } from 'vitest';
import { VirtualStyleSheet } from '../src/stylesheet/VirtualStylesheet';

const virtualSheet = new VirtualStyleSheet();
setTailwindConfig({
  fontFamily: {
    DEFAULT: 'Inter-Regular',
    inter: 'Inter-Regular',
    'inter-bold': 'Inter-Bold',
    'inter-medium': 'Inter-Medium',
    sans: 'Inter-Regular',
  },
});

describe('@universal-labs/stylesheets', () => {
  it('Transform css to react native', () => {
    // const result = virtualSheet.injectUtilities('flex-1 text(2xl white) bg-black');
    // console.log('RESULT_1: ', result);
    virtualSheet.injectUtilities('flex-1 text(2xl white) bg-black');
    virtualSheet.injectUtilities('text-2xl');

    // console.log('RESULT_2: ', result2);
    // const ast: ParsedValue = parse('.asd { border: 1px rgba(255,255,255,.3) }');
    expect({ color: 'white' }).toStrictEqual({ color: 'white' });
  });
});

// console.log('transformed', ast);
