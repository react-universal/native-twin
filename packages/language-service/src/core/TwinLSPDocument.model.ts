import { TinyColor } from '@ctrl/tinycolor';
// import * as RA from 'effect/Array';
// import * as Option from 'effect/Option';
import type * as VSCDocument from 'vscode-languageserver-textdocument';
import * as t from 'vscode-languageserver-types';
import { BaseTwinTextDocument } from '../documents/common/BaseTwinDocument';
import type * as LSP from '../internal/LSPAdapterSpec';
import type { LocatedTokenResult, TwinRuleRegistry } from '../models/TwinParser.models';
import { getCompletionTokenKind } from '../utils/language/language.utils';

export class TwinLSPDocument extends BaseTwinTextDocument {
  readonly regions: LSP.JsxNodeRegion[];
  get parsableRegions() {
    return this.regions.flatMap((region) =>
      region.styledProps.map((x) => x.attributeValue).map((attr) => [region, attr] as const),
    );
  }

  constructor(textDocument: VSCDocument.TextDocument, regions: LSP.JsxNodeRegion[]) {
    super(textDocument);
    this.regions = regions.map((x) => fixRegionRanges(x, textDocument));
  }

  findRegionAt(position: LSP.LSPPosition): LSP.JsxAttributeValueRegion | null {
    return (
      this.parsableRegions.find((x) => this.isPositionInRange(position, x[1].range))?.[1] ?? null
    );
  }

  getCompletionItem(
    rule: TwinRuleRegistry,
    _locatedToken: LocatedTokenResult,
    cursorOffset: number,
  ) {
    const replaceText = rule.className.replace(_locatedToken.lookupText, '');
    const insertReplacement = t.TextEdit.insert(this.positionAt(cursorOffset), replaceText);
    const completion = {
      label: rule.className,
      kind: getCompletionTokenKind(rule.info.themeSection),
      detail: getCompletionEntryDetailsDisplayParts(rule)?.text ?? '',
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

  sumPositions(p1: LSP.LSPPosition, p2: LSP.LSPPosition) {
    if (p1.line !== p2.line) {
      console.debug('Cant sum positions on different lines');
      return p2;
    }
    return t.Position.create(p1.line, p1.character + p2.character);
  }

  sumRanges(r1: LSP.LSPRange, r2: LSP.LSPRange) {
    return t.Range.create(this.sumPositions(r1.start, r2.start), this.sumPositions(r1.end, r2.end));
  }
}

export const getKindModifiers = (item: TwinRuleRegistry): string =>
  item.info.meta.feature === 'colors' || item.info.themeSection === 'colors' ? 'color' : '';

export function getCompletionEntryDetailsDisplayParts(rule: TwinRuleRegistry) {
  if (rule.info.meta.feature === 'colors' || rule.info.themeSection === 'colors') {
    const hex = new TinyColor(rule.declarationValue);
    if (hex.isValid) {
      return {
        kind: 'color',
        text: hex.toHexString(),
      };
    }
    return {
      kind: 'color',
      text: rule.declarationValue,
    };
  }
  return undefined;
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
