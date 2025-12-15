import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { LSPParser } from '../core/LSPParser.service';
import { JSXAttribute, JSXAttributeValue, JSXNode, Range } from '../models/LSP.models';
import { JSXParser, JSXParserLive } from './JSXParser.service';
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
  };
}).pipe(Effect.provide(JSXParserLive), Layer.effect(LSPParser));

export const fixRegionRanges = (node: JSXNode, doc: TextDocument): JSXNode => {
  const attributes: JSXAttribute[] = [];
  for (const attribute of node.attributes) {
    const { value } = attribute;
    const originalText = value.rawText;
    const parsableText = value.text;
    const documentText = doc.getText(
      Range.from(doc.positionAt(value.startOffset), doc.positionAt(value.endOffset)),
    );
    let newText = value.text;
    let finalStartOffset = value.startOffset;

    const subset = new Set([originalText, parsableText, documentText]);
    if (subset.size === 3) {
      if (newText.startsWith('`')) {
        newText = newText.slice(1);
        finalStartOffset += 1;
        if (newText.endsWith('`')) {
          newText = newText.slice(0, newText.lastIndexOf('`'));
        }
        attributes.push(
          JSXAttribute.make({
            ...attribute,
            value: JSXAttributeValue.make({
              ...value,
              startOffset: finalStartOffset,
              text: newText,
            }),
          }),
        );
        continue;
      }
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
      const finalStart = finalStartOffset + counterDif - cursorDiff;
      const finalEnd = finalStartOffset + parsableText.length + counterDif - cursorDiff;

      attributes.push(
        JSXAttribute.make({
          ...attribute,
          value: JSXAttributeValue.make({
            ...value,
            startOffset: finalStart,
            endOffset: finalEnd,
            text: newText,
          }),
        }),
      );
    }
  }
  return JSXNode.make({
    ...node,
    attributes,
  });
};
