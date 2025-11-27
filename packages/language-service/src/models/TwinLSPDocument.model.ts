import type * as VSCDocument from 'vscode-languageserver-textdocument';
import type * as LSP from '../internal/LSPAdapterSpec';
import { BaseTwinTextDocument } from './BaseTwinDocument';


export class TwinLSPDocument extends BaseTwinTextDocument {
  readonly regions: LSP.JsxNodeRegion[];
  readonly parsableRegions: { region: LSP.JsxNodeRegion; attr: LSP.JsxAttributeValueRegion }[];

  constructor(textDocument: VSCDocument.TextDocument, regions: LSP.JsxNodeRegion[]) {
    super(textDocument);
    this.regions = regions.map((x) => fixRegionRanges(x, textDocument));
    this.parsableRegions = this.regions.flatMap((region) =>
      region.styledProps.map((x) => x.attributeValue).map((attr) => ({ region, attr })),
    );
  }

  findRegionAt(position: LSP.LSPPosition): LSP.JsxAttributeValueRegion | null {
    return (
      this.parsableRegions.find((x) => this.isPositionInRange(position, x.attr.range))?.attr ?? null
    );
  }
}

const fixRegionRanges = (
  node: LSP.JsxNodeRegion,
  doc: VSCDocument.TextDocument,
): LSP.JsxNodeRegion => {
  const styledProps: LSP.JsxAttributeRegion[] = [];
  for (const attribute of node.styledProps) {
    const { attributeValue } = attribute;
    const originalText = attributeValue.rawText;
    const parsableText = attributeValue.text;
    const documentText = doc.getText(attributeValue.range);

    const subset = new Set([originalText, parsableText, documentText]);
    if (subset.size === 3) {
      styledProps.push(attribute);
      continue;
    }
    const starOffset = doc.offsetAt(attributeValue.range.start);
    let counterDif = 0;
    let cursor = 0;
    while (cursor < originalText.length) {
      const parsableChar = parsableText[cursor];
      const char = originalText[cursor + counterDif];
      if (char !== parsableChar) {
        counterDif += 1;
      }
      cursor++;
      if (!char) break;
    }
    const finalStart = doc.positionAt(starOffset + counterDif);
    const finalEnd = doc.positionAt(starOffset + parsableText.length + counterDif);

    styledProps.push({
      ...attribute,
      attributeValue: {
        ...attributeValue,
        range: { start: finalStart, end: finalEnd },
      },
    });
  }

  return {
    ...node,
    styledProps,
  };
};
