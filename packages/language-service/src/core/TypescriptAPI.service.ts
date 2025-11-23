import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import ts from 'typescript';

declare module 'typescript' {
  export function getTokenPosOfNode(
    node: ts.Node,
    sourceFile: ts.SourceFileLike,
    includeJsDoc?: boolean,
  ): number;
}

type _TypescriptApi = typeof ts;
export interface TypeScriptApi extends _TypescriptApi {}
export const TypeScriptApi = Context.GenericTag<TypeScriptApi>('TypeScriptApi');

// type _TypeScriptProgram = ts.Program;
export interface TypeScriptProgram {
  getSourceFile: (filename: string) => Effect.Effect<ts.SourceFile>;
}
export const TypeScriptProgram = Context.GenericTag<TypeScriptProgram>('TypeScriptProgram');

export const createCustomProgram = (rootDir: string, tsConfigPath: string) => {
  function getCurrentDirectory(): string {
    return rootDir;
  }
  function formatDiagnostics(diagnostics: ts.Diagnostic[]): string | undefined {
    return ts.formatDiagnostics(diagnostics, {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory,
      getNewLine: () => '\n',
    });
  }
  // const tsConfigRaw = fs.readFileSync(tsConfigPath).toString('utf-8');
  const tsConfig = ts.getParsedCommandLineOfConfigFile(
    tsConfigPath,
    {
      ...ts.getDefaultCompilerOptions(),
      noUnusedLocals: false,
      noUnusedParameters: false,
      jsx: ts.JsxEmit.Preserve,
      allowArbitraryExtensions: true,
      checkJs: false,
      noEmitOnError: false,
      target: ts.ScriptTarget.ESNext,
    },
    {
      fileExists: ts.sys.fileExists,
      getCurrentDirectory,
      onUnRecoverableConfigFileDiagnostic: (diag) => {
        throw new Error(formatDiagnostics([diag]));
      },
      readDirectory: ts.sys.readDirectory,
      readFile: (file) =>
        ts.sys.readFile(
          ts.pathIsAbsolute(file) ? file : ts.resolvePath(getCurrentDirectory(), file),
          'utf-8',
        ),
      useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
      directoryExists: ts.sys.directoryExists,
    },
  );
  if (!tsConfig || tsConfig?.errors.length > 0) {
    throw new Error(formatDiagnostics(tsConfig?.errors ?? []));
  }
  const compilerOptions = ts.convertCompilerOptionsFromJson(tsConfig, rootDir, tsConfigPath);
  const host = ts.createCompilerHost(
    {
      ...ts.getDefaultCompilerOptions(),
      ...tsConfig.options,
      noEmit: true,
    },
    true,
  );
  const program = ts.createProgram({
    options: compilerOptions.options,
    rootNames: tsConfig.fileNames,
    host,
    projectReferences: tsConfig.projectReferences,
    configFileParsingDiagnostics: tsConfig.errors,
  });

  return { host, program };
};
