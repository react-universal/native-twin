import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as LSP from '../core/LSP';

export const classNameCompletions = LSP.createTwinCompletions({
  name: 'classNameCompletions',
  apply: Effect.fn('classNameCompletions')(function* (filename, position, executor) {
    // const parsedFile = (yield* executor.getTokenAtPosition(position)).pipe(Option.getOrNull);
    const token = yield* executor
      .getRegionAt(filename, position)
      .pipe(Effect.map(Option.getOrNull));

    if (!token) {
      yield* Effect.log(`Couldn't find node at position: ${position}`);
    }

    return {
      nextRegion: Option.none(),
      prevRegion: Option.none(),
      region: Option.fromNullable(token),
      twinTokens: [],
    } satisfies LSP.LSPTwinCompletionsResult;

    // const sourceFile = program.getSourceFile(ts.normalizePath(params.textDocument.uri));
    // if (!sourceFile) return yield* Effect.fail();

    // const nodeAtPosition = tsUtils.findNodeAtPosition(sourceFile, params.position.character);
    // if (!nodeAtPosition) return [];

    // function findJSXElement(node: ts.Node) {
    //   if (ts.isJsxElement(node.parent) || ts.isJsxSelfClosingElement(node.parent)) {
    //     return node.parent;
    //   }
    //   if (!node.parent) return null;
    //   return findJSXElement(node.parent);
    // }

    // function findJSXAttributeParent(node: ts.Node) {
    //   if (ts.isJsxAttributeLike(node.parent)) {
    //     return node.parent;
    //   }
    //   if (!node.parent) return null;
    //   return findJSXAttributeParent(node.parent);
    // }

    // if (ts.isStringLiteralOrJsxExpression(nodeAtPosition) || ts.isTemplateLiteral(nodeAtPosition)) {
    //   const startPositionAdvance = ts.isNoSubstitutionTemplateLiteral(nodeAtPosition) ? 1 : 0;
    //   const attribute = findJSXAttributeParent(nodeAtPosition);
    //   if (!attribute) return [];
    //   const jsxContainer = findJSXElement(attribute);
    //   if (!jsxContainer) return [];

    //   const mappedProps = tsUtils.getJSXMappedProps(jsxContainer, sourceFile);
    //   const parsedClassNames = mappedProps.map((prop) =>
    //     parser.runTwinParser(prop.originalText, nodeAtPosition.pos + startPositionAdvance),
    //   );
    //   const locatedNode = parsedClassNames
    //     .map((x) =>
    //       parser.findComposedClassAtPosition(x.composedClasses, params.position.character),
    //     )
    //     .find((x) => x !== null);
    //   if (!locatedNode) return [];

    //   // const needleText = locatedNode;
    //   const endOffset = locatedNode.node.documentLoc.range.end - params.position.character;
    //   let finalText = locatedNode.lookupText.slice(0, -endOffset);
    //   if (finalText === '') finalText = locatedNode.lookupText;
    //   const completions = (yield* parser.findRulesByKey(finalText)).map((registry) => {
    //     const rule = registry.toRuleCompletion();
    //     const completion: vscode.CompletionItem = {
    //       kind: vscode.CompletionItemKind.Color,
    //       // name: rule.completion.className,
    //       sortText: rule.completion.className,
    //       insertText: rule.completion.className.replace(finalText, ''),
    //       filterText: rule.completion.className,
    //       labelDetails: {
    //         description: rule.rule.themeSection ?? '',
    //         detail: rule.completion.declarationValue,
    //       },
    //       label: rule.completion.className,
    //       detail: toColorValue(rule.completion.declarationValue),
    //       insertTextMode: vscode.InsertTextMode.adjustIndentation,
    //     };
    //     return completion;
    //   });
    //   console.log(
    //     'MAPPED:PROPS: ',
    //     mappedProps,
    //     parsedClassNames,
    //     locatedNode,
    //     finalText,
    //     completions,
    //   );
    //   // return completions;
    // }

    // return {} as unknown as LSP.LSPTwinCompletionsResult;
  }),
});
