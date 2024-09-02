import { runFixture } from './test.utils';

describe('Babel Compiler', () => {
  it('Child Selectors', async () => {
    const compiler = await runFixture('twin-compiler', 'ios');
    expect(compiler.result).toBeDefined();
  });
  it('Compile for web', async () => {
    const compiler = await runFixture('twin-compiler', 'web');
    expect(compiler.result).toBeDefined();
  });
});
