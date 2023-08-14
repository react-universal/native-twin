import { expect, it, describe } from 'vitest';
import { createIntellisense } from '../src/intellisense/extractUserTheme';
import { inspect } from 'util';

const intellisense = createIntellisense();

describe('TS PLUGIN', () => {
  it('suggest with empty input', () => {
    console.log('RULES: ', inspect(intellisense.config.rules, false, null, true));
    expect(intellisense.cache.size).toStrictEqual(13419);
  });
});

// test('suggest when additional modifiers exist', () => {
//   expect($(intellisense.suggest('bg-'))).resolves.toMatchSnapshot();
// });
