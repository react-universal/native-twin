import fs from 'node:fs';
import path from 'node:path';
import { createBabelTestCompilerProgram } from './test.utils';

describe('Babel Compiler', () => {
  it('Child Selectors', async () => {
    const compiler = await createBabelCompilerText('twin-compiler');
    expect(compiler.result).toBeDefined();
  });
});

const createBabelCompilerText = async (fixturePath: string) => {
  const codePath = path.join(__dirname, 'fixtures', fixturePath, 'code.tsx');
  const outputPath = path.join(__dirname, 'fixtures', fixturePath, 'out.tsx');
  fs.writeFileSync(outputPath, '');
  const result = await createBabelTestCompilerProgram(codePath);
  fs.writeFileSync(outputPath, result.generated ?? 'ERROR');
  return { result, file: fs.readFileSync(outputPath) };
};
