import { glob } from 'glob';
import * as Mocha from 'mocha';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });
  mocha.timeout(100000);

  const testsRoot = __dirname;

  return new Promise((_resolve, _reject) => {
    glob('./**/*/**.test.js', { cwd: testsRoot });
  });
}
