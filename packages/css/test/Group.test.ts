import clsx from 'clsx';
import { describe, expect, it } from 'vitest';
import { generateStylesFor } from './test-utils';

describe('@universal-labs/css - GROUP', () => {
  it('Complex', () => {
    const result = generateStylesFor(
      clsx(
        'flex-1',
        'hover:(web:(bg-blue-600) ios:(bg-green-600) android:(bg-black))',
        'ios:(p-14 bg-rose-200 border-white border-2)',
        'android:(p-14 border-green-200 border-2 bg-gray-200)',
        'items-center justify-center md:border-3',
        'group-hover:text-2xl hover:text-3xl',
      ),
    );
    expect(result).toStrictEqual({
      base: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '0%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 56,
        backgroundColor: 'rgba(254,205,211,1)',
        borderColor: 'rgba(255,255,255,1)',
        borderWidth: 2,
      },
      even: {},
      first: {},
      group: { fontSize: 24, lineHeight: 32 },
      last: {},
      odd: {},
      pointer: {
        fontSize: 30,
        lineHeight: 36,
        backgroundColor: 'rgba(22,163,74,1)',
      },
    });
  });
});
