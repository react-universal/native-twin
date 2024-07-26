import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import fs from 'node:fs';
import path from 'node:path';
import type { RuntimeComponentEntry } from '@native-twin/babel/build/jsx';
import type { RuntimeTW } from '@native-twin/core';
import { twinShift } from '../../babel/twin.shift';
import type { TwinFileHandlerArgs } from '../../metro.types';
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
    return twinShift(this.filename, this.getText(), tw);
  }

  getTwinComponentStyles(compiled: [string, RuntimeComponentEntry[]][]) {
    return `\nvar __twinComponentStyles = ${JSON.stringify(Object.fromEntries(compiled))}`;
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
