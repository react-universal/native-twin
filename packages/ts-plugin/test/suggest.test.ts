import { expect, it, describe } from 'vitest';
import { createIntellisense } from '../src/intellisense/createIntellisense';

describe('TS PLUGIN', () => {
  it('Complete suggestion list', () => {
    const intellisense = createIntellisense();
    expect(intellisense.classes.size).toStrictEqual(5633);
  });
});
