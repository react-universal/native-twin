import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import fs from 'fs';
import path from 'path';
import { createBabelAST } from '../src/babel';
import { getAstTrees } from '../src/jsx';

describe('test ast trees', () => {
  it('Create JSX tree', async () => {
    const filePath = path.join(__dirname, 'fixtures', 'jsx', 'code-ast.tsx');
    const code = fs.readFileSync(filePath);
    const ast = createBabelAST(code.toString('utf-8'));
    const result = await pipe(getAstTrees(ast, filePath), Effect.runPromise);
    expect(result.length).toBeGreaterThan(0);
  });
});
