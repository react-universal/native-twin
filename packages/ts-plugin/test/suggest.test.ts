import { expect, it, describe } from 'vitest';
import { ConfigurationManager } from '../src/language-service/configuration';
import { NativeTailwindIntellisense } from '../src/language-service/createIntellisense';
import { LanguageServiceLogger } from '../src/language-service/logger';

const config = new ConfigurationManager();
// @ts-expect-error
const logger: LanguageServiceLogger = {
  log: () => {},
};
const intellisense = new NativeTailwindIntellisense(logger, config);
describe('TS PLUGIN', () => {
  it('Complete suggestion list', () => {
    expect(intellisense.completions().classes.size).toStrictEqual(12557);
  });
  it('Enumerate completions', () => {
    expect(Array.from(intellisense.completions().classes, ([name]) => name)).toMatchSnapshot(
      'Completions Snapshot',
    );
  });
});
