import * as ReadonlyArray from 'effect/Array';
import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import ts from 'typescript';
import * as VSCDocument from 'vscode-languageserver-textdocument';
import { Position, Range } from 'vscode-languageserver/node';
import { parseTemplate } from '../native-twin/native-twin.parser';
import { TemplateTokenWithText } from '../template/template.models';
import { Matcher } from '../utils/match';
import { getTemplateLiteralNode } from './utils/document.utils';

export class TwinDocument implements Equal.Equal {
  readonly handler: VSCDocument.TextDocument;
  readonly sourceMatchers: Matcher[];

  constructor(document: VSCDocument.TextDocument, matcher: Matcher[]) {
    this.handler = document;
    this.sourceMatchers = matcher;
  }

  /** Gets the document full text */
  get fullText() {
    return this.handler.getText();
  }

  /** Gets the `typescript` AST */
  get getDocumentSource() {
    return ts.createSourceFile(
      this.handler.uri,
      this.handler.getText(),
      ts.ScriptTarget.Latest,
      /*setParentNodes*/ true,
    );
  }

  getTextForRange(range: Range) {
    const text = this.handler.getText(range);
    return text;
  }

  getRelativeOffset(template: TemplateNode, position: Position) {
    return this.handler.offsetAt({
      line: template.range.start.line,
      character: position.character - template.range.start.character,
    });
  }

  getRelativePosition(relativeOffset: number) {
    return this.handler.positionAt(relativeOffset);
  }

  getTokenPosition(
    part: Pick<TemplateTokenWithText, 'loc' | 'text'>,
    templateRange: Range,
  ) {
    const realStart = this.handler.positionAt(
      part.loc.start + templateRange.start.character,
    );
    const realEnd = {
      ...realStart,
      character: realStart.character + part.text.length,
    };
    return Range.create(realStart, realEnd);
  }

  /** Gets the template literal at this position */
  getTemplateNodeAtPosition(position: Position): Option.Option<TemplateNode> {
    const cursorOffset = this.handler.offsetAt(position);

    const source = this.getDocumentSource;
    const template = getTemplateLiteralNode(source, cursorOffset, this.sourceMatchers);

    const templateRange = template.pipe(
      Option.map((x) => {
        const templateStart = x.getStart() + 1;
        // x.getStart() + x.kind !== ts.SyntaxKind.StringLiteral ? 1 : 0;
        const templateEnd = x.getEnd() - 1;
        // x.getEnd() - x.kind !== ts.SyntaxKind.StringLiteral ? 1 : 0;
        return Range.create(
          this.handler.positionAt(templateStart),
          this.handler.positionAt(templateEnd),
        );
      }),
    );

    return Option.zipWith(template, templateRange, (node, range) => {
      return new TemplateNode(node, range);
    });
  }

  [Equal.symbol](that: unknown) {
    return that instanceof TwinDocument && that.fullText === this.fullText;
  }

  [Hash.symbol](): number {
    return Hash.hash(this.fullText);
  }
}

export class TemplateNode implements Equal.Equal {
  constructor(
    readonly node:
      | ts.TemplateLiteral
      | ts.StringLiteralLike
      | ts.NoSubstitutionTemplateLiteral,
    readonly range: Range,
  ) {}

  get parsedNode() {
    const text = this.node.getFullText().slice(1, -1);
    const parsed = parseTemplate(text);
    return parsed;
  }

  getTokensAtPosition(offset: number) {
    return pipe(
      this.parsedNode,
      ReadonlyArray.filter((x) => offset >= x.loc.start && offset <= x.loc.end),
    );
  }

  [Equal.symbol](that: unknown) {
    return that instanceof TemplateNode && that.range === this.range;
  }

  [Hash.symbol](): number {
    return Hash.hash(
      `${this.range.end.character}-${this.range.start.character}-${this.node.getFullText()}`,
    );
  }
}
