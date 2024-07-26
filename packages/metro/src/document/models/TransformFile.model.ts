import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import fs from 'node:fs';
import path from 'node:path';
import type { RuntimeComponentEntry } from '@native-twin/babel/build/jsx';
import type { RuntimeTW } from '@native-twin/core';
import type { TwinFileHandlerArgs } from '../../metro.types';
import { ensureBuffer, matchCss } from '../../utils';
import { twinShift } from '../twin.shift';

export class TransformFile implements Equal.Equal {
  private textDocument: Buffer;
  private filename: string;
  private projectRoot: string;
  private type: string;
  version: number;

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

  get fileExists(): boolean {
    return fs.existsSync(this.uri);
  }

  get isCss(): boolean {
    return this.type !== 'asset' && matchCss(this.filename);
  }

  compileFile(tw: RuntimeTW) {
    return twinShift(this.filename, this.textDocument.toString('utf-8'), tw);
  }

  getTwinComponentStyles(compiled: [string, RuntimeComponentEntry[]][]) {
    return `\nvar __twinComponentStyles = ${JSON.stringify(Object.fromEntries(compiled))}`;
  }

  isEqual(buffer: Buffer) {
    return this.textDocument.equals(buffer);
  }

  refreshDocument(file: TwinFileHandlerArgs) {
    this.filename = file.filename;
    this.textDocument = ensureBuffer(file.data);
    this.version = this.version + 1;
  }

  [Equal.symbol](that: unknown) {
    return (
      that instanceof TransformFile &&
      this.uri === that.uri &&
      this.textDocument.equals(that.textDocument)
    );
  }

  [Hash.symbol](): number {
    return Hash.hash(this.filename);
  }
}
