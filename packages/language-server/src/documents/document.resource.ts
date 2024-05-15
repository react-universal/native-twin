import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import * as VSCDocument from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver/node';
import { parseTemplate } from '../native-twin/native-twin.parser';
import { TemplateTokenWithText } from '../template/template.models';
import { NativeTwinPluginConfiguration } from '../types/extension.types';
import { getTwinStringRanges } from './utils/document.ast';

export class TwinDocument implements Equal.Equal {
  readonly handler: VSCDocument.TextDocument;
  readonly config: NativeTwinPluginConfiguration;

  constructor(document: VSCDocument.TextDocument, config: NativeTwinPluginConfiguration) {
    this.handler = document;
    this.config = config;
  }

  get languageRanges() {
    return getTwinStringRanges(this.handler.getText(), this.config).map((x) =>
      vscode.Range.create(
        this.handler.positionAt(x.start.index),
        this.handler.positionAt(x.end.index),
      ),
    );
  }

  getRangeAtPosition(
    part: Pick<TemplateTokenWithText, 'loc' | 'text'>,
    templateRange: vscode.Range,
  ) {
    const realStart = this.handler.positionAt(
      part.loc.start + templateRange.start.character,
    );
    const realEnd = {
      ...realStart,
      character: realStart.character + part.text.length,
    };
    return vscode.Range.create(realStart, realEnd);
  }

  /** Gets the template literal at this position */
  getTemplateNodeAtPosition(position: vscode.Position): Option.Option<TemplateNode> {
    const cursorOffset = this.handler.offsetAt(position);

    const source = Option.fromNullable(
      this.languageRanges.find(
        (x) =>
          cursorOffset >= this.handler.offsetAt(x.start) &&
          cursorOffset <= this.handler.offsetAt(x.end),
      ),
    );

    return Option.map(
      source,
      (range) => new TemplateNode(this, this.handler.getText(range), range),
    );
  }

  getAllTemplates() {
    return this.languageRanges.map((x) => {
      return new TemplateNode(this, this.handler.getText(x), x);
    });
  }

  [Equal.symbol](that: unknown) {
    return (
      that instanceof TwinDocument &&
      that.handler.getText() === this.handler.getText() &&
      this.handler.uri === that.handler.uri
    );
  }

  [Hash.symbol](): number {
    return Hash.hash(this.handler.getText());
  }
}

export class TemplateNode implements Equal.Equal {
  constructor(
    readonly handler: TwinDocument,
    readonly text: string,
    readonly range: vscode.Range,
  ) {}

  get parsedNode() {
    const text = this.text.replace("'", '');
    let offset = this.handler.handler.offsetAt(this.range.start);
    if (this.text.startsWith("'")) {
      offset = offset + 1;
    }
    const parsed = parseTemplate(text, offset);
    return parsed;
  }

  [Equal.symbol](that: unknown) {
    return (
      that instanceof TemplateNode &&
      that.range === this.range &&
      this.range.start.character === that.range.start.character &&
      that.text === this.text
    );
  }

  [Hash.symbol](): number {
    return Hash.hash(
      `${this.range.end.character}-${this.range.start.character}-${this.text}`,
    );
  }
}
