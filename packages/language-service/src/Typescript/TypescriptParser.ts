import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { LSPParser } from '../core/LSPParser.service';
import type { JsxAttributeRegion, JsxNodeRegion } from '../models/LSP.models';
import { JSXParser } from './JSXParser.service';
import { TypeScriptProgram } from './TypescriptAPI.service';

export const TypescriptParser = Effect.gen(function* () {
  const parser = yield* JSXParser;
  const program = yield* TypeScriptProgram;

  const parseFile = Effect.fn(function* (filename: string, code: string) {
    const tsSource = yield* program.getSourceFile(filename, code);
    const jsxRoots = parser.getJSXRootsFromSource(tsSource);
    const regions = parser.jsxNodesToRegions(jsxRoots);
    return regions;
  });

  return {
    parseFile,
    fixRegionRanges,
  };
}).pipe(Layer.effect(LSPParser));

const fixRegionRanges = (node: JsxNodeRegion, doc: TextDocument): JsxNodeRegion => {
  const styledProps: JsxAttributeRegion[] = [];
  for (const attribute of node.styledProps) {
    const { attributeValue } = attribute;
    const originalText = attributeValue.rawText;
    const parsableText = attributeValue.text;
    const documentText = doc.getText(attributeValue.range);

    const subset = new Set([originalText, parsableText, documentText]);
    if (subset.size === 3) {
      if (attributeValue.text.startsWith('`')) {
        attributeValue.text = attributeValue.text.slice(1);
        attributeValue.range.start.character += 1;
      }
      if (attributeValue.text.endsWith('`')) {
        attributeValue.text = attributeValue.text.slice(0, attributeValue.text.lastIndexOf('`'));
      }
      styledProps.push(attribute);
      continue;
    }
    const starOffset = doc.offsetAt(attributeValue.range.start);
    let counterDif = 0;
    let cursor = 0;
    while (cursor < originalText.length) {
      const parsableChar = parsableText[cursor];
      const char = originalText[cursor + counterDif];
      if (!char) break;
      if (char !== parsableChar) {
        ++counterDif;
      }
      ++cursor;
    }
    const cursorDiff = cursor - parsableText.length;
    const finalStart = doc.positionAt(starOffset + counterDif - cursorDiff);
    const finalEnd = doc.positionAt(starOffset + parsableText.length + counterDif - cursorDiff);

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
