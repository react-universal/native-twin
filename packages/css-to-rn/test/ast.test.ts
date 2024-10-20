import { Array, Layer } from 'effect';
import * as Effect from 'effect/Effect';
import fs from 'fs';
import path from 'path';
import * as BabelCompiler from '../src/babel';
import { NativeTwinServiceNode } from '../src/node';

const MainLive = BabelCompiler.makeBabelLayer;
const createTestLayer = (input: BabelCompiler.CompilerInput) =>
  MainLive.pipe(
    Layer.provideMerge(BabelCompiler.makeBabelInput(input)),
    Layer.provideMerge(
      NativeTwinServiceNode.Live(
        input.options.twinConfigPath,
        input.options.projectRoot,
        input.options.platform,
      ),
    ),
  );

describe('test ast trees', () => {
  it('Create JSX tree', async () => {
    const filePath = path.join(__dirname, 'fixtures', 'jsx', 'code-ast.tsx');
    const code = fs.readFileSync(filePath);
    const layer = createTestLayer({
      code: code.toString(),
      filename: filePath,
      options: {
        inputCSS: '',
        outputCSS: '',
        platform: 'ios',
        projectRoot: process.cwd(),
        twinConfigPath: path.join(__dirname, './tailwind.config.ts'),
      },
    });
    const ast = Effect.flatMap(BabelCompiler.ReactCompilerService, (x) =>
      x.getTrees(code.toString(), filePath),
    ).pipe(
      Effect.map((x) => Array.fromIterable(x)),
      Effect.provide(layer),
      Effect.runSync,
    );
    expect(ast.length).toBeGreaterThan(0);
  });
});
