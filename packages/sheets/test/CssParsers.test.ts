import { describe, expect, it } from 'vitest';
import { cssParser } from '../src/css/css.parser';

const addClassNames = cssParser();

describe('@universal-labs/stylesheets', () => {
  it('Css to AST', () => {
    const result = addClassNames(
      'text-2xl translate-x-2 hover:text-red-500 first:bg-gray-100 flex-1',
    );

    expect(result).toStrictEqual({
      evaluated: {
        base: {
          fontSize: 24,
          lineHeight: 32,
          transform: [{ translateX: 32 }, { translateY: 0 }],
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '0%',
        },
        even: {},
        first: { backgroundColor: 'rgba(243,244,246,1)' },
        group: {},
        last: {},
        odd: {},
        pointer: { color: 'rgba(239,68,68,1)' },
      },
      isGroupParent: false,
    });
  });
});
