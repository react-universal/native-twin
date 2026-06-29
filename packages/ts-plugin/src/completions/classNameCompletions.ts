import { toColorValue } from '@native-twin/helpers';
import * as Effect from 'effect/Effect';
import ts from 'typescript';
import * as LSP from '../core/LSP';
import { TypescriptUtils } from '../core/TypescriptUtils.service';
import { TwinParserContext } from '../twin/TwinParser.service';

export const classNameCompletions: LSP.TwinCompletion = LSP.createTwinCompletions({
  name: 'classNameCompletions',
  apply: Effect.fn('classNameCompletions')(function* (sourceFile, position) {
    const tsUtils = yield* TypescriptUtils;
    const parser = yield* TwinParserContext;

    const nodeAtPosition = tsUtils.findNodeAtPosition(sourceFile, position);
    if (!nodeAtPosition) return [];

    function findJSXElement(node: ts.Node) {
      if (ts.isJsxElement(node.parent) || ts.isJsxSelfClosingElement(node.parent)) {
        return node.parent;
      }
      if (!node.parent) return null;
      return findJSXElement(node.parent);
    }

    function findJSXAttributeParent(node: ts.Node) {
      if (ts.isJsxAttributeLike(node.parent)) {
        return node.parent;
      }
      if (!node.parent) return null;
      return findJSXAttributeParent(node.parent);
    }

    if (ts.isStringLiteralOrJsxExpression(nodeAtPosition) || ts.isTemplateLiteral(nodeAtPosition)) {
      const startPositionAdvance = ts.isNoSubstitutionTemplateLiteral(nodeAtPosition) ? 1 : 0;
      const attribute = findJSXAttributeParent(nodeAtPosition);
      if (!attribute) return [];
      const jsxContainer = findJSXElement(attribute);
      if (!jsxContainer) return [];

      const mappedProps = tsUtils.getJSXMappedProps(jsxContainer, sourceFile);
      const parsedClassNames = mappedProps.map((prop) =>
        parser.runTwinParser(prop.originalText, nodeAtPosition.pos + startPositionAdvance),
      );
      const locatedNode = parsedClassNames
        .map((x) => x.findNodeAt(position))
        .find((x) => x !== null);
      if (!locatedNode) return [];
      // const needleText = locatedNode;
      const endOffset = locatedNode.node.documentLoc.end - position;
      let finalText = locatedNode.lookupText.slice(0, -endOffset);
      if (finalText === '') finalText = locatedNode.lookupText;
      const completions = (yield* parser.findRulesByKey(finalText)).map((registry) => {
        const rule = registry.toRuleCompletion();
        const completion: ts.CompletionEntry = {
          kind: ts.ScriptElementKind.constElement,
          name: rule.completion.className,
          sortText: rule.completion.className,
          insertText: rule.completion.className.replace(finalText, ''),
          filterText: rule.completion.className,
          labelDetails: {
            description: rule.rule.themeSection ?? '',
            detail: rule.completion.declarationValue,
          },
          kindModifiers: 'color',
          sourceDisplay: [
            {
              kind: 'color',
              text: toColorValue(rule.completion.declarationValue),
            },
          ],
          source: 'native-twin',
        };
        return completion;
      });
      console.log(
        'MAPPED:PROPS: ',
        mappedProps,
        parsedClassNames,
        locatedNode,
        finalText,
        completions,
      );
      return completions;
    }

    return [] satisfies Array<LSP.CompletionEntryDefinition>;
  }),
});
