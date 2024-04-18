import ts from 'typescript';
import { TemplateSettings } from 'typescript-template-language-service-decorator';
import { relative } from 'typescript-template-language-service-decorator/lib/nodes';
import ScriptSourceHelper from 'typescript-template-language-service-decorator/lib/script-source-helper';

const kText = Symbol('kText');

export class StandardTemplateContext /* implements TemplateContext */ {
  private [kText]: string | undefined = undefined;

  constructor(
    public readonly typescript: typeof ts,
    public readonly fileName: string,
    public readonly node: ts.StringLiteralLike | ts.TemplateLiteral,
    private readonly helper: ScriptSourceHelper,
    private readonly templateSettings: TemplateSettings,
  ) {}

  public toOffset(position: ts.LineAndCharacter): number {
    const docOffset = this.helper.getOffset(
      this.fileName,
      position.line + this.stringBodyPosition.line,
      position.line === 0
        ? this.stringBodyPosition.character + position.character
        : position.character,
    );
    return docOffset - this.stringBodyOffset;
  }

  public toPosition(offset: number): ts.LineAndCharacter {
    const docPosition = this.helper.getLineAndChar(
      this.fileName,
      this.stringBodyOffset + offset,
    );
    return relative(this.stringBodyPosition, docPosition);
  }

  // @memoize
  private get stringBodyOffset(): number {
    return this.node.getStart() + 1;
  }

  // @memoize
  private get stringBodyPosition(): ts.LineAndCharacter {
    return this.helper.getLineAndChar(this.fileName, this.stringBodyOffset);
  }

  // @memoize
  public get text(): string {
    return (
      this[kText] ||
      (this[kText] = this.typescript.isTemplateExpression(this.node)
        ? PlaceholderSubstituter.replacePlaceholders(
            this.typescript,
            this.templateSettings,
            this.node,
          )
        : this.node.text)
    );
  }

  // @memoize
  public get rawText(): string {
    return this.node.getText().slice(1, -1);
  }
}

class PlaceholderSubstituter {
  public static replacePlaceholders(
    typescript: typeof ts,
    settings: TemplateSettings,
    node: ts.TemplateExpression | ts.NoSubstitutionTemplateLiteral,
  ): string {
    const literalContents = node.getText().slice(1, -1);
    if (node.kind === typescript.SyntaxKind.NoSubstitutionTemplateLiteral) {
      return literalContents;
    }

    return PlaceholderSubstituter.getSubstitutions(
      settings,
      literalContents,
      PlaceholderSubstituter.getPlaceholderSpans(node),
    );
  }

  private static getPlaceholderSpans(node: ts.TemplateExpression) {
    const spans: Array<{ start: number; end: number }> = [];
    const stringStart = node.getStart() + 1;

    let nodeStart = node.head.end - stringStart - 2;
    for (const child of node.templateSpans.map((x) => x.literal)) {
      const start = child.getStart() - stringStart + 1;
      spans.push({ start: nodeStart, end: start });
      nodeStart = child.getEnd() - stringStart - 2;
    }
    return spans;
  }

  private static getSubstitutions(
    settings: TemplateSettings,
    contents: string,
    locations: ReadonlyArray<{ start: number; end: number }>,
  ): string {
    if (settings.getSubstitutions) {
      return settings.getSubstitutions(contents, locations);
    }

    const parts: string[] = [];
    let lastIndex = 0;
    for (const span of locations) {
      parts.push(contents.slice(lastIndex, span.start));
      parts.push(this.getSubstitution(settings, contents, span.start, span.end));
      lastIndex = span.end;
    }
    parts.push(contents.slice(lastIndex));
    return parts.join('');
  }

  private static getSubstitution(
    settings: TemplateSettings,
    templateString: string,
    start: number,
    end: number,
  ): string {
    return settings.getSubstitution
      ? settings.getSubstitution(templateString, start, end)
      : 'x'.repeat(end - start);
  }
}
