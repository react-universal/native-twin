import type * as VSCDocument from 'vscode-languageserver-textdocument';
import * as t from 'vscode-languageserver-types';
import type * as LSP from '../internal/LSPAdapterSpec';
import {
  getCompletionEntryDetailsDisplayParts,
  getCompletionTokenKind,
} from '../utils/language/language.utils';
import { BaseTwinTextDocument } from './BaseTwinDocument';
import type { LocatedTokenResult, TwinRuleRegistry } from './TwinParser.models';

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

  getCompletionItem(
    rule: TwinRuleRegistry,
    locatedToken: LocatedTokenResult,
    cursorOffset: number,
  ) {
    const replaceText = rule.className.replace(locatedToken.lookupText, '');
    const insertReplacement = t.TextEdit.insert(this.positionAt(cursorOffset), replaceText);
    const completion = {
      label: rule.className,
      kind: getCompletionTokenKind(rule.info.themeSection),
      detail:
        getCompletionEntryDetailsDisplayParts({
          declarationValue: rule.declarationValue,
          feature: rule.info.meta.feature,
          themeSection: rule.info.themeSection,
        })?.text ?? '',
      labelDetails: {
        description: rule.declarations.join(','),
      },
      insertText: insertReplacement.newText,
      insertTextFormat: t.InsertTextFormat.PlainText,
      insertTextMode: t.InsertTextMode.adjustIndentation,
      textEdit: insertReplacement,
      textEditText: insertReplacement.newText,
    } satisfies t.CompletionItem;
    return completion;
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
