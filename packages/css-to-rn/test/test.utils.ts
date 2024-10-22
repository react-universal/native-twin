import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import fs from 'fs';
import path from 'path';
import * as TwinBabel from '../src/babel';
import { compileReactCode } from '../src/babel/programs/react.program';
import * as TwinNode from '../src/node';

const reactProgram = Effect.gen(function* () {
  const input = yield* TwinBabel.BabelInput;
  const babel = yield* TwinBabel.BabelCompiler;
  const result = yield* compileReactCode(input).pipe(
    Effect.flatMap((x) => babel.buildFile(x.ast)),
  );

  return result;
}).pipe(Effect.scoped);

const MainLive = TwinBabel.makeBabelLayer;

export const createTestLayer = (input: TwinBabel.CompilerInput) => {
  return MainLive.pipe(
    Layer.provideMerge(TwinBabel.makeBabelInput(input)),
    Layer.provideMerge(
      TwinNode.NativeTwinServiceNode.Live(
        input.options.twinConfigPath,
        input.options.projectRoot,
        input.options.platform,
      ),
    ),
  );
};

export const runFixture = (fixturePath: string) => {
  const filePath = path.join(__dirname, 'fixtures', fixturePath);
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

  return reactProgram.pipe(Effect.provide(layer), Effect.runPromise);
};

export const writeFixtureOutput = (
  code: string,
  paths: { fixturePath: string; outputFile: string },
) => {
  const filePath = path.join(__dirname, 'fixtures', paths.fixturePath, paths.outputFile);
  fs.writeFileSync(filePath, code);
  return code;
};
