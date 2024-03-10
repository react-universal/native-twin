import { ConfigurationManager } from '../src/language-service/configuration';
import { NativeTailwindIntellisense } from '../src/language-service/intellisense.service';
import { LanguageServiceLogger } from '../src/language-service/logger';

const config = new ConfigurationManager();
// @ts-expect-error
const logger: LanguageServiceLogger = {
  log: () => {},
};
const intellisense = new NativeTailwindIntellisense(logger, config);
describe('TS PLUGIN', () => {
  it('Complete suggestion list', () => {
    expect(intellisense.completions().classes.size).toStrictEqual(5530);
  });
  it('Enumerate completions', () => {
    expect(Array.from(intellisense.completions().classes, ([name]) => name)).toMatchSnapshot(
      'Completions Snapshot',
    );
  });
});
