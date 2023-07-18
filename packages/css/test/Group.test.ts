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
        'odd:bg-black even:bg-black',
        'first:bg-black last:bg-black',
        'dark:bg-blue-200',
      ),
      true,
    );
    expect(result).toStrictEqual({
      base: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '0%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 56,
        backgroundColor: 'rgba(191,219,254,1)',
        borderColor: 'rgba(255,255,255,1)',
        borderWidth: 2,
      },
      even: { backgroundColor: 'rgba(0,0,0,1)' },
      first: { backgroundColor: 'rgba(0,0,0,1)' },
      group: { fontSize: 24, lineHeight: 32 },
      last: { backgroundColor: 'rgba(0,0,0,1)' },
      odd: { backgroundColor: 'rgba(0,0,0,1)' },
      pointer: {
        fontSize: 30,
        lineHeight: 36,
        backgroundColor: 'rgba(22,163,74,1)',
      },
    });
  });
});
