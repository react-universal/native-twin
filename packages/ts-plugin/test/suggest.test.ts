import { test, expect, beforeAll } from 'vitest';
import { presetTailwind, TailwindTheme } from '@universal-labs/twind-adapter';
import { BaseTheme, defineConfig } from '@universal-labs/twind-native';
import { Intellisense, createIntellisense, Suggestion } from '../src/createIntellisense';

let intellisense: Intellisense<BaseTheme & TailwindTheme>;

beforeAll(() => {
  intellisense = createIntellisense(
    defineConfig({
      presets: [presetTailwind()],
    }),
  );
});

const $ = (suggestions: Promise<Suggestion[]>) =>
  suggestions.then((suggestions) => suggestions.map(({ value }) => value));

test('suggest with empty input', () => {
  expect(intellisense.suggest('')).resolves.toHaveLength(13419);
});

// test('suggest with single char input', async () => {
//   await expect($(intellisense.suggest('u'))).resolves.toMatchSnapshot();
// });

// test('suggest with two chars', async () => {
//   await expect($(intellisense.suggest('ma'))).resolves.toMatchSnapshot();
// });

// test('suggest negated', async () => {
//   await expect($(intellisense.suggest('-mb'))).resolves.toMatchSnapshot();
// });

test('suggest when additional modifiers exist', () => {
  expect($(intellisense.suggest('bg-'))).resolves.toMatchSnapshot();
});
