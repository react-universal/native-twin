import { bench, describe, expect } from 'vitest';
import { InlineStyleSheet } from '../src';
import { VirtualStyleSheet } from '../src/stylesheet/VirtualStylesheet';

const virtualSheet = new VirtualStyleSheet();

describe('@universal-labs/stylesheets', () => {
  bench(
    'Extract Classes',
    () => {
      expect(virtualSheet.getClasses('flex-1 text(2xl white) bg-black')).toEqual([
        'flex-1',
        'text-2xl',
        'text-white',
        'bg-black',
      ]);
    },
    { time: 1000 },
  );
  bench(
    'Transform classNames',
    () => {
      expect(new InlineStyleSheet('flex-1 text(2xl white) bg-black')).toBeDefined();
    },
    { time: 1000 },
  );
});

// console.log('transformed', ast);
