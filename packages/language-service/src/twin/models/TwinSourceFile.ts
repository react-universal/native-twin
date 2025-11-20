import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Stream from 'effect/Stream';
import type ts from 'ts-morph';
import type { TwinDslModels } from '../../typescript/TwinDsl.models';

export class TwinTypescriptFile implements Equal.Equal {
  private sourceFile: ts.SourceFile;
  jsxDeclarators: TwinDslModels.NodeJSXDeclarator[];
  id: string;

  get filePath() {
    return this.sourceFile.getFilePath();
  }

  get languageRegions() {
    return Stream.fromIterable(this.jsxDeclarators).pipe(
      Stream.map((x) => x.jsxElement.getAllNodes()),
      Stream.flattenIterables,
      Stream.map((x) => x.getLanguageRegions()),
      Stream.flattenIterables,
      Stream.runCollect,
    );
  }

  get twinClassNameNodes() {
    return Stream.fromIterable(this.jsxDeclarators).pipe(
      Stream.flatMap((declarator) => Stream.fromIterable(declarator.jsxElement.getAllNodes())),
      Stream.map((jsxNode) => jsxNode.getLanguageRegions),
    );
  }

  constructor(sourceFile: ts.SourceFile, jsxDeclarators: TwinDslModels.NodeJSXDeclarator[]) {
    this.sourceFile = sourceFile;
    this.id = createTwinSourceFileID(sourceFile).toString();
    this.jsxDeclarators = jsxDeclarators;
  }

  isTsSourceEquals(that: ts.SourceFile) {
    return (
      this.sourceFile === that ||
      this.filePath === that.getFilePath() ||
      this.sourceFile.getText() === that.getText()
    );
  }

  [Hash.symbol]() {
    return Hash.string(this.id);
  }

  [Equal.symbol](that: unknown) {
    return that instanceof TwinTypescriptFile && that.id === this.id;
  }
}

export const createTwinSourceFileID = (file: ts.SourceFile) =>
  Hash.string(`${file.getFilePath()}_${file.getText()}`);
