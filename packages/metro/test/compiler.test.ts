import fs from 'node:fs';
import path from 'node:path';
import { createBabelTestCompilerProgram, createTestCompilerProgram } from './test.utils';

describe('TS Compiler', () => {
  it('Child Selectors', async () => {
    const compiler = await createCompilerTest('childs');
    expect(compiler.result.code).toBeDefined();
  });
});

describe('Babel Compiler', () => {
  it('Child Selectors', async () => {
    const compiler = await createBabelCompilerText('childs');
    expect(compiler.result.code).toBeDefined();
  });
});

const createCompilerTest = async (fixturePath: string) => {
  const codePath = path.join(__dirname, 'fixtures', fixturePath, 'code.tsx');
  const outputPath = path.join(__dirname, 'fixtures', fixturePath, 'out.tsx');

  const result = await createTestCompilerProgram(codePath);
  fs.writeFileSync(outputPath, result.full ?? 'ERROR');
  return { result, file: fs.readFileSync(outputPath) };
};

const createBabelCompilerText = async (fixturePath: string) => {
  const codePath = path.join(__dirname, 'fixtures', fixturePath, 'code.tsx');
  const outputPath = path.join(__dirname, 'fixtures', fixturePath, 'out-babel.tsx');
  fs.writeFileSync(outputPath, '');
  const result = await createBabelTestCompilerProgram(codePath);
  fs.writeFileSync(outputPath, result.full ?? 'ERROR');
  return { result, file: fs.readFileSync(outputPath) };
};
