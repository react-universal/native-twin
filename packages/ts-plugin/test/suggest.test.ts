import { expect, it, describe } from 'vitest';
import { createIntellisense } from '../src/intellisense/createIntellisense';

const intellisense = createIntellisense();
describe('TS PLUGIN', () => {
  it('Complete suggestion list', () => {
    expect(intellisense.classes.size).toStrictEqual(11954);
  });
  it('Enumerate completions', () => {
    expect(Array.from(intellisense.classes, ([name]) => name)).toMatchSnapshot(
      'Completions Snapshot',
    );
  });
});
