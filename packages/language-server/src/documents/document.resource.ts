import * as t from '@babel/types';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import * as VSCDocument from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver/node';
import { parseTemplate } from '../native-twin/native-twin.parser';
import { TemplateTokenWithText } from '../template/template.models';
import { NativeTwinPluginConfiguration } from '../types/extension.types';
import { getDocumentLanguageLocations } from './utils/document.ast';

export class TwinDocument implements Equal.Equal {
  readonly handler: VSCDocument.TextDocument;
  readonly config: NativeTwinPluginConfiguration;

  constructor(document: VSCDocument.TextDocument, config: NativeTwinPluginConfiguration) {
    this.handler = document;
    this.config = config;
  }

  get languageRanges() {
    return getDocumentLanguageLocations(this.handler.getText(), this.config).map((x) =>
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

export class DocumentLanguageRegion implements Equal.Equal {
  private constructor(
    readonly range: vscode.Range,
    readonly offset: {
      start: number;
      end: number;
    },
  ) {}

  static create(
    document: VSCDocument.TextDocument,
    range: vscode.Range | t.SourceLocation,
  ): DocumentLanguageRegion {
    if (vscode.Range.is(range)) {
      return new DocumentLanguageRegion(range, {
        start: document.offsetAt(range.start),
        end: document.offsetAt(range.end),
      });
    }

    const newRange = vscode.Range.create(
      document.positionAt(range.start.index),
      document.positionAt(range.end.index),
    );

    return new DocumentLanguageRegion(newRange, {
      start: document.offsetAt(newRange.start),
      end: document.offsetAt(newRange.end),
    });
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof DocumentLanguageRegion &&
      this.offset.start === that.offset.start &&
      this.offset.end === that.offset.end &&
      this.range.start.character === that.range.start.character
    );
  }

  [Hash.symbol](): number {
    return Hash.array([this.offset.start, this.offset.end, this.range.start.character]);
  }
}
