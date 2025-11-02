import path from 'node:path';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import ts from 'ts-morph';

export const tsLayer = Effect.fn(function* (tsconfigPath: string) {
  const compiler = makeTSProject(tsconfigPath);
  const fs = compiler.getFileSystem();
  const program = compiler.getProgram();

  const getNodeSourceFile = (node: ts.Node) => node.getSourceFile();
  const getNodeOffset = (node: ts.Node): number => node.getPos();

  const findNodeAtOffset = (node: ts.Node, offset: number): Option.Option<ts.Node> =>
    Option.fromNullable(node.getChildAtPos(offset));

  const getJSXRoots = (node: ts.SourceFile) => node.getStructure();

  const extractSourceInfo = (source: ts.SourceFile) => {
    const exports = source.getExportDeclarations();
    const declarations = source.getImportDeclarations();
    const functions = source.getFunctions();
    const outsideNodes = source.getReferencingNodesInOtherSourceFiles();

    const scanner = ts.ts.createScanner(
      compiler.getCompilerOptions().target ?? ts.ScriptTarget.ESNext,
      false,
      ts.LanguageVariant.JSX,
      '',
      (error) => console.log('got an error !!!', error),
      0,
    );

    const scan = scanner.reScanJsxToken(true);

    return { exports, declarations, functions, outsideNodes };
  };

  return yield* Effect.succeed({
    fs,
    extractSourceInfo,
    getNodeSourceFile,
    findNodeAtOffset,
    getJSXRoots,
    getNodeOffset,
    program,
    compiler,
  });
});

export interface TypescriptApi extends Effect.Effect.Success<ReturnType<typeof tsLayer>> {}
export const TypescriptApi = Context.GenericTag<TypescriptApi>('TypescriptApi');

export const TypescriptApiLive = (tsConfig: string) =>
  Layer.effect(TypescriptApi, tsLayer(tsConfig));

export const makeTSProject = (tsConfigPath: string) => {
  const compilerOptions = ts.getCompilerOptionsFromTsConfig(tsConfigPath);

  const registry = ts.ts.createDocumentRegistry(true);

  registry.getKeyForCompilationSettings(compilerOptions.options);
  const compiler = new ts.Project({
    tsConfigFilePath: path.join(process.cwd(), 'tsconfig.build.json'),
    compilerOptions: compilerOptions.options,
    skipAddingFilesFromTsConfig: true,
    manipulationSettings: {
      indentationText: ts.IndentationText.TwoSpaces,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
      newLineKind: ts.NewLineKind.LineFeed,
      quoteKind: ts.QuoteKind.Double,
      useTrailingCommas: true,
    },
  });

  return compiler;
};
