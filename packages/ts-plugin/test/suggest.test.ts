import { test, expect, beforeAll } from 'vitest';
import presetTailwind from '@twind/preset-tailwind';
import { BaseTheme, defineConfig } from '@universal-labs/twind-adapter';
import { TailwindTheme } from '@twind/preset-tailwind';
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

test('suggest with empty input', async () => {
  await expect(intellisense.suggest('')).resolves.toHaveLength(11948);
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

test('suggest when additional modifiers exist', async () => {
  await expect($(intellisense.suggest('bg-'))).resolves.toMatchSnapshot();
});
