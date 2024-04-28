import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import ts from 'typescript';
import * as VSCDocument from 'vscode-languageserver-textdocument';
import { Position, Range } from 'vscode-languageserver/node';
import { parseTemplate } from '../native-twin/native-twin.parser';
import { LocatedGroupToken } from '../template/template.types';

export class TwinDocument implements Equal.Equal {
  readonly internal: VSCDocument.TextDocument;

  constructor(document: VSCDocument.TextDocument) {
    this.internal = document;
  }

  /** Gets the document full text */
  get fullText() {
    return this.internal.getText();
  }

  /** Gets the `typescript` AST */
  get getDocumentSource() {
    return ts.createSourceFile(
      this.internal.uri,
      this.internal.getText(),
      ts.ScriptTarget.Latest,
      /*setParentNodes*/ true,
    );
  }

  getTextForRange(range: Range) {
    return this.internal.getText(range);
  }

  getRelativeOffset(template: TemplateNode, position: Position) {
    return this.internal.offsetAt({
      line: template.range.start.line,
      character: position.character - template.range.start.character,
    });
  }

  getRelativePosition(relativeOffset: number) {
    return this.internal.positionAt(relativeOffset);
  }

  /** Gets the template literal at this position */
  getTemplateNodeAtPosition(position: Position): Option.Option<TemplateNode> {
    const cursorOffset = this.internal.offsetAt(position);

    const source = this.getDocumentSource;
    const template = getTemplateLiteralNode(source, cursorOffset);

    const templateRange = template.pipe(
      Option.map((x) => {
        const templateStart = x.getStart() + 1;
        const templateEnd = x.getEnd() - 1;
        return Range.create(
          this.internal.positionAt(templateStart),
          this.internal.positionAt(templateEnd),
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
    readonly node: ts.TemplateLiteral,
    readonly range: Range,
  ) {}

  get parsedNode() {
    return parseTemplate(this.node.getText().slice(1, -1));
  }

  getTokensAtPosition(offset: number) {
    return pipe(
      ReadonlyArray.fromIterable(this.parsedNode),
      ReadonlyArray.filter((x) => offset >= x.start && offset <= x.end),
      ReadonlyArray.map((x) => {
        if (x.type === 'VARIANT') {
          return {
            ...x,
            type: 'GROUP',
            value: {
              base: x,
              content: [],
            },
            end: x.end,
            start: x.start,
          } satisfies LocatedGroupToken;
        }
        return x;
      }),
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

function getTemplateLiteralNode(source: ts.SourceFile, cursorOffset: number) {
  let template: ts.TemplateLiteral | ts.NoSubstitutionTemplateLiteral | undefined;
  // getTokenAtPosition is not really public but widely used. May break in a future version.
  let token = (ts as any).getTokenAtPosition(source, cursorOffset);
  while (token) {
    if (
      token.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral ||
      token.kind === ts.SyntaxKind.TemplateExpression
    ) {
      template = token;
    }
    token = token.parent;
  }

  return Option.fromNullable(template);
}