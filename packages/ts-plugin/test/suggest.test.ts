import { expect, it, describe } from 'vitest';
import { createIntellisense } from '../src/intellisense/createIntellisense';

describe('TS PLUGIN', () => {
  it('Complete suggestion list', () => {
    const intellisense = createIntellisense();
    // 5608 - 1
    // 5622 - 2
    expect(intellisense.classes.size).toStrictEqual(6010);
  });
  it('Enumerate completions', () => {
    const intellisense = createIntellisense();
    console.log('ALIGN: ', intellisense.getCss('columns-xs'));
    expect(Array.from(intellisense.classes, ([name]) => name)).toMatchSnapshot(
      'Completions Snapshot',
    );
  });
});
