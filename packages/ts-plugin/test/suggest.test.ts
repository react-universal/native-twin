import { test, expect } from 'vitest';
import { createIntellisense } from '../src/intellisense/extractUserTheme';

const intellisense = createIntellisense();

const _$ = (suggestions: Promise<any[]>) =>
  suggestions.then((suggestions) => suggestions.map(({ value }) => value));

test('suggest with empty input', () => {
  expect(intellisense.cache.size).resolves.toHaveLength(13419);
});

// test('suggest when additional modifiers exist', () => {
//   expect($(intellisense.suggest('bg-'))).resolves.toMatchSnapshot();
// });
