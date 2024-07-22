import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import fs from 'node:fs';
import path from 'node:path';
import { RuntimeTW } from '@native-twin/core';
import { parseDocument } from '../../transformer/babel-parser/twin.parser';
import { TwinFileHandlerArgs } from '../../transformer/files/file.models';
import { ensureBuffer, matchCss } from '../../utils/file.utils';

export class TransformFile implements Equal.Equal {
  private readonly textDocument: Buffer;
  private readonly filename: string;
  private readonly projectRoot: string;
  private readonly type: string;
  readonly version: number;

  constructor(document: TwinFileHandlerArgs, version: number) {
    this.textDocument = ensureBuffer(document.data);
    this.filename = document.filename;
    this.projectRoot = document.projectRoot;
    this.type = document.type;
    this.version = version;
  }

  get uri() {
    return path.join(this.projectRoot, this.filename);
  }

  readFile() {
    return fs.readFileSync(this.uri, 'utf-8');
  }

  getText(): string {
    return Buffer.from(this.textDocument).toString('utf-8');
  }

  setFileContent(contents: string) {
    return fs.writeFileSync(this.uri, contents);
  }

  get fileExists(): boolean {
    return fs.existsSync(this.uri);
  }

  get isCss(): boolean {
    return this.type !== 'asset' && matchCss(this.filename);
  }

  compileFile(tw: RuntimeTW) {
    return parseDocument(this.filename, this.version, this.getText(), tw);
  }

  isEqual(buffer: Buffer) {
    return this.textDocument.equals(buffer);
  }

  [Equal.symbol](that: unknown) {
    return (
      that instanceof TransformFile &&
      this.uri === that.uri &&
      this.textDocument.equals(that.textDocument) &&
      that.getText() === this.getText()
    );
  }

  [Hash.symbol](): number {
    return Hash.hash(Buffer.from(this.textDocument).toString('utf-8'));
  }
}
