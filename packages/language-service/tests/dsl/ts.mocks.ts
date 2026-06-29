import fs from 'node:fs';
import ts from 'ts-morph';

export function createLSPHostMock(filename: string, sourceText: string): ts.ts.LanguageServiceHost {
  return {
    getCompilationSettings() {
      return {
        ...ts.ts.getDefaultCompilerOptions(),
        strict: true,
        target: ts.ScriptTarget.ESNext,
        noEmit: true,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        paths: {
          '@/*': ['fixtures/*'],
        },
      };
    },
    getScriptFileNames() {
      return [filename];
    },
    getScriptVersion(_) {
      return '';
    },
    getScriptSnapshot(_) {
      if (_ !== filename) return ts.ts.ScriptSnapshot.fromString(sourceText);
      return ts.ts.ScriptSnapshot.fromString(fs.readFileSync(__filename).toString('utf-8'));
    },
    getCurrentDirectory: () => '.',
    getDefaultLibFileName(options) {
      return ts.ts.getDefaultLibFilePath(options);
    },
    fileExists: (_fileName) => {
      if (_fileName === filename) return true;
      return fs.existsSync(_fileName);
    },
    readFile: (_fileName) => {
      if (_fileName === filename) return sourceText;
      return fs.readFileSync(_fileName).toString();
    },
  };
}

export function createServicesWithMockedVFS(fileName: string, sourceText: string) {
  const languageServiceHost = createLSPHostMock(fileName, sourceText);
  const languageService = ts.ts.createLanguageService(
    languageServiceHost,
    undefined,
    ts.ts.LanguageServiceMode.Semantic,
  );
  const program = languageService.getProgram();
  if (!program) throw new Error('No typescript program!');
  const sourceFile = program.getSourceFile(fileName);
  if (!sourceFile) throw new Error(`No source file ${fileName} in VFS`);

  return { languageService, program, sourceFile, languageServiceHost };
}
