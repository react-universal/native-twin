import { expect, it, describe } from 'vitest';
import { createIntellisense } from '../src/intellisense/createIntellisense';

describe('TS PLUGIN', () => {
  it('Complete suggestion list', () => {
    const intellisense = createIntellisense();
    expect(intellisense.classes.size).toStrictEqual(12556);
  });
  it('Enumerate completions', () => {
    const intellisense = createIntellisense();
    expect(Array.from(intellisense.classes, ([name]) => name)).toMatchSnapshot(
      'Completions Snapshot',
    );
  });
});
