/* eslint-disable no-console */
import util from 'util';
import { describe, expect, it } from 'vitest';
import { cssParser } from '../src/css/css.parser';

const tokenizer = cssParser();

describe('@universal-labs/stylesheets', () => {
  it('Css to AST', () => {
    const result = tokenizer(
      'text-2xl translate-x-2 hover:text-red-500 first:bg-gray-100 flex-1',
    );
    console.log('AST: ', util.inspect(result, false, null, true /* enable colors */));

    expect(result.ast).toStrictEqual({
      type: 'sheet',
      rules: [
        {
          type: 'rule',
          declarations: [
            {
              type: 'declaration',
              rawDeclaration: 'transform:translate(2rem)',
              kind: 'transform',
              declaration: { property: 'transform', value: 'translate(2rem)' },
            },
          ],
          isGroupEvent: false,
          isPointerEvent: false,
          rawDeclarations: 'transform:translate(2rem)',
          rawSelector: 'translate-x-2',
        },
        {
          type: 'rule',
          declarations: [
            {
              type: 'declaration',
              rawDeclaration: 'flex:1 1 0%',
              kind: 'flex',
              declaration: { property: 'flex', value: '1 1 0%' },
            },
          ],
          isGroupEvent: false,
          isPointerEvent: false,
          rawDeclarations: 'flex:1 1 0%',
          rawSelector: 'flex-1',
        },
        {
          type: 'rule',
          declarations: [
            {
              type: 'declaration',
              rawDeclaration: 'font-size:1.5rem',
              kind: 'style',
              declaration: { property: 'font-size', value: '1.5rem' },
            },
            {
              type: 'declaration',
              rawDeclaration: 'line-height:2rem',
              kind: 'style',
              declaration: { property: 'line-height', value: '2rem' },
            },
          ],
          isGroupEvent: false,
          isPointerEvent: false,
          rawDeclarations: 'font-size:1.5rem;line-height:2rem',
          rawSelector: 'text-2xl',
        },
        {
          type: 'rule',
          declarations: [
            {
              type: 'declaration',
              rawDeclaration: '--tw-bg-opacity:1',
              kind: 'variable',
              declaration: { property: '--tw-bg-opacity', value: '1' },
            },
            {
              type: 'declaration',
              rawDeclaration: 'background-color:rgba(243,244,246,var(--tw-bg-opacity))',
              kind: 'color',
              declaration: {
                property: 'background-color',
                value: 'rgba(243,244,246,1)',
              },
            },
          ],
          isGroupEvent: false,
          isPointerEvent: false,
          rawDeclarations:
            '--tw-bg-opacity:1;background-color:rgba(243,244,246,var(--tw-bg-opacity))',
          rawSelector: 'first:bg-gray-100:first-child',
        },
        {
          type: 'rule',
          declarations: [
            {
              type: 'declaration',
              rawDeclaration: '--tw-text-opacity:1',
              kind: 'variable',
              declaration: { property: '--tw-text-opacity', value: '1' },
            },
            {
              type: 'declaration',
              rawDeclaration: 'color:rgba(239,68,68,var(--tw-text-opacity))',
              kind: 'color',
              declaration: {
                property: 'color',
                value: 'rgba(239,68,68,1)',
              },
            },
          ],
          isGroupEvent: false,
          isPointerEvent: true,
          rawDeclarations: '--tw-text-opacity:1;color:rgba(239,68,68,var(--tw-text-opacity))',
          rawSelector: 'hover:text-red-500:hover',
        },
      ],
    });
  });
});
