import type * as VSCDocument from 'vscode-languageserver-textdocument';
import { fixRegionRanges } from '../internal/TwinParser.internals';
import { BaseTwinTextDocument } from './BaseTwinDocument';
import type * as LSP from './LSP.models';

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
