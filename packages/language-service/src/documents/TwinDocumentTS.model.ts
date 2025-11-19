import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import type ts from 'ts-morph';
import type { TwinDslModels } from '../typescript/TwinDsl.models';

export class TwinDocumentTS {
  private _sourceFile: ts.SourceFile;
  jsxDeclarators: TwinDslModels.NodeJSXDeclarator[];
  id: TwinDocumentID;

  get sourceFile() {
    return this._sourceFile;
  }

  constructor(sourceFile: ts.SourceFile, jsxDeclarators: TwinDslModels.NodeJSXDeclarator[]) {
    this._sourceFile = sourceFile;
    this.id = createDocumentID(sourceFile);
    this.jsxDeclarators = jsxDeclarators;
  }
  [Hash.symbol]() {
    return Hash.structure(this.id);
  }

  [Equal.symbol](that: unknown) {
    return that instanceof TwinDocumentTS && Equal.equals(that.id, this.id);
  }
}

export class TwinDocumentID implements Equal.Equal {
  readonly id: number;
  constructor(source: ts.SourceFile) {
    this.id = Hash.string(`${source.getFilePath()}_${source.getText()}`);
  }
  [Hash.symbol]() {
    return Hash.number(this.id);
  }

  [Equal.symbol](that: unknown) {
    return that instanceof TwinDocumentID && that.id === this.id;
  }
}

export type TwinDocumentRAW = any;

export const createDocumentID = (source: ts.SourceFile) => new TwinDocumentID(source);
