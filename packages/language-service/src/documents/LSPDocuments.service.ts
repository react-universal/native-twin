import { traverse } from '@babel/core';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import type * as lsp from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { LSPConfigService } from '../services/LSPConfig.service.js';
import type { BaseTwinTextDocument } from './common/BaseTwinDocument.js';
import { DocumentLanguageRegion } from './common/LanguageRegion.model.js';

export interface DocumentsServiceShape {
  handler: lsp.TextDocuments<TextDocument>;
  getDocument: (uri: string) => Effect.Effect<Option.Option<BaseTwinTextDocument>>;
  setupConnection(connection: lsp.Connection): void;
  getRegionAt: (
    twinDoc: BaseTwinTextDocument,
    location: t.SourceLocation,
  ) => DocumentLanguageRegion;
  getLanguageRegions: <T extends BaseTwinTextDocument>(
    document: T,
  ) => Effect.Effect<DocumentLanguageRegion[], never, never>;
  findTokenAtPosition: (
    twinDocument: BaseTwinTextDocument,
    position: lsp.Position,
  ) => Effect.Effect<Option.Option<DocumentLanguageRegion>>;
}

export interface TwinLSPDocumentContext extends DocumentsServiceShape {}
export const TwinLSPDocumentContext = Context.GenericTag<TwinLSPDocumentContext>(
  'parsers/TwinLSPDocumentContext',
);

const quotesRegex = /^['"`].*['"`]$/g;

const make = Effect.fn(function* (
  handler: lsp.TextDocuments<TextDocument>,
  DocumentConstructor: new (
    ...params: ConstructorParameters<typeof BaseTwinTextDocument>
  ) => BaseTwinTextDocument,
) {
  const config = yield* LSPConfigService;

  yield* config.changes.pipe(
    Stream.runForEach((x) => Effect.log('STREAM_CHANGES: ', x)),
    Effect.fork,
  );

  const acquireDocument = (uri: string) =>
    Effect.gen(function* () {
      const currentConfig = yield* config.get;
      return Option.map(
        Option.fromNullable(handler.get(uri)),
        (x) => new DocumentConstructor(x, currentConfig.vscode),
      );
    });

  const getLanguageRegions = Effect.fn(function* (twinDoc: BaseTwinTextDocument) {
    const currentConfig = yield* config.get;
    const regions = extractLanguageRegions(twinDoc.getText(), currentConfig.vscode);
    return RA.map(regions, (x) => getRegionAt(twinDoc, x));
  });

  const getRegionAt = (twinDoc: BaseTwinTextDocument, location: t.SourceLocation) => {
    const range = babelLocationToRange(twinDoc, location);
    const text = twinDoc.getText(range);
    const startOffset = twinDoc.offsetAt(range.start);
    const endOffset = twinDoc.offsetAt(range.end);
    return new DocumentLanguageRegion(range, startOffset, endOffset, text);
  };

  const findTokenAtPosition = Effect.fn(function* (
    twinDocument: BaseTwinTextDocument,
    position: lsp.Position,
  ) {
    const regions = yield* getLanguageRegions(twinDocument);
    const positionOffset = twinDocument.offsetAt(position);
    return RA.findFirst(regions, (x) =>
      twinDocument.isPositionAtOffset({ end: x.endOffset, start: x.startOffset }, positionOffset),
    );
  });

  return {
    handler,
    getDocument: acquireDocument,
    setupConnection: setupConnection(handler),
    getLanguageRegions,
    findTokenAtPosition,
    getRegionAt,
  };

  function babelLocationToRange(
    twinDocument: BaseTwinTextDocument,
    location: t.SourceLocation,
  ): lsp.Range {
    const startPosition: lsp.Position = {
      line: location.start.line,
      character: location.start.column,
    };
    const endPosition: lsp.Position = {
      line: location.end.line,
      character: location.end.column,
    };

    const range: lsp.Range = {
      start: startPosition,
      end: endPosition,
    };
    const text = twinDocument.getText(range);

    if (quotesRegex.test(text)) {
      range.start.character += 1;
      range.end.character -= 1;
      return { ...range };
    }
    return range;
  }

  function setupConnection(handler: lsp.TextDocuments<TextDocument>) {
    return (connection: lsp.Connection) => handler.listen(connection);
  }
});

export const twinLSPDocumentLayer = (...args: Parameters<typeof make>) =>
  Layer.effect(TwinLSPDocumentContext, make(...args));

// const traverseLanguageRegions = (
//   code: string,
//   config: {
//     functions: string[];
//     jsxAttributes: string[];
//   },
// ) =>
//   Effect.try(() => {
//     const ast = parse(code, {
//       plugins: ['jsx', 'typescript'],
//       sourceType: 'module',
//       errorRecovery: true,
//       startLine: 0,
//       startColumn: 1,
//       tokens: false,
//       ranges: true,
//     });

//     const babelRegions = Stream.async<BabelLanguageRegionData>((emit) => {
//       traverse(ast, {
//         Program: {
//           exit() {
//             emit.end();
//           },
//         },
//         CallExpression: (path) => {
//           const callee = path.get('callee');

//           if (callee.isIdentifier() && config.functions.includes(callee.node.name)) {
//             emit.single({
//               location: Option.fromNullable(path.node.loc),
//               path,
//             });
//           }
//         },
//         TaggedTemplateExpression: (path) => {
//           if (
//             t.isIdentifier(path.node.tag) &&
//             config.functions.includes(path.node.tag.name) &&
//             path.node.quasi.quasis
//           ) {
//             emit.single({
//               location: Option.fromNullable(path.node.loc),
//               path,
//             });
//           }
//         },
//         JSXAttribute: (path) => {
//           if (
//             t.isJSXIdentifier(path.node.name) &&
//             config.jsxAttributes.includes(path.node.name.name) &&
//             path.node.value
//           ) {
//             if (t.isStringLiteral(path.node.value)) {
//               emit.single({
//                 location: Option.fromNullable(path.node.loc),
//                 path,
//               });
//             }
//             if (
//               t.isJSXExpressionContainer(path.node.value) &&
//               t.isTemplateLiteral(path.node.value.expression)
//             ) {
//               emit.single({
//                 location: Option.fromNullable(path.node.loc),
//                 path,
//               });
//             }

//             if (
//               t.isJSXExpressionContainer(path.node.value) &&
//               t.isStringLiteral(path.node.value.expression)
//             ) {
//               emit.single({
//                 location: Option.fromNullable(path.node.loc),
//                 path,
//               });
//             }
//           }
//         },
//       });
//     });

//     return {
//       ast,
//       babelRegions,
//     };
//   });

export const extractLanguageRegions = (
  code: string,
  config: {
    functions: string[];
    jsxAttributes: string[];
  },
): t.SourceLocation[] => {
  const sourceLocations: t.SourceLocation[] = [];
  try {
    const parsed = parse(code, {
      plugins: ['jsx', 'typescript'],
      sourceType: 'module',
      errorRecovery: true,
      startLine: 0,
      startColumn: 1,
      tokens: false,
      ranges: true,
    });
    traverse(parsed, {
      CallExpression: (path) => {
        const sources: t.SourceLocation[] = [];
        const callee = path.get('callee');
        if (
          callee.isIdentifier() &&
          // t.isIdentifier(path.node.callee) &&
          config.functions.includes(callee.node.name)
        ) {
          for (const arg of path.node.arguments) {
            if (t.isObjectExpression(arg)) {
              sources.push(...matchVariantsObject(arg.properties));
            }
          }
        }
        sourceLocations.push(...sources);
      },
      TaggedTemplateExpression: (path) => {
        if (
          t.isIdentifier(path.node.tag) &&
          config.functions.includes(path.node.tag.name) &&
          path.node.quasi.quasis
        ) {
          sourceLocations.push(...templateExpressionMatcher(path.node.quasi.quasis));
        }
      },
      JSXAttribute: (path) => {
        if (
          t.isJSXIdentifier(path.node.name) &&
          config.jsxAttributes.includes(path.node.name.name) &&
          path.node.value
        ) {
          if (t.isStringLiteral(path.node.value) && path.node.value.loc) {
            sourceLocations.push(path.node.value.loc);
          }
          if (
            t.isJSXExpressionContainer(path.node.value) &&
            t.isTemplateLiteral(path.node.value.expression)
          ) {
            sourceLocations.push(...templateExpressionMatcher(path.node.value.expression.quasis));
          }

          if (
            t.isJSXExpressionContainer(path.node.value) &&
            t.isStringLiteral(path.node.value.expression) &&
            path.node.value.expression.loc
          ) {
            sourceLocations.push(path.node.value.expression.loc);
          }
        }
      },
    });

    return sourceLocations;
  } catch (_e) {
    return sourceLocations;
  }
};

const matchVariantsObject = (
  properties: t.ObjectExpression['properties'],
  results: t.SourceLocation[] = [],
): t.SourceLocation[] => {
  const nextProperty = properties.shift();
  if (!nextProperty) return results;

  if (t.isObjectProperty(nextProperty)) {
    if (t.isStringLiteral(nextProperty.value) && nextProperty.value.loc) {
      results.push(nextProperty.value.loc);
    }

    if (t.isTemplateLiteral(nextProperty.value)) {
      results.push(...templateExpressionMatcher(nextProperty.value.quasis, results));
    }

    if (t.isObjectExpression(nextProperty.value)) {
      return matchVariantsObject(nextProperty.value.properties, results);
    }
  }

  return matchVariantsObject(properties, results);
};

const templateExpressionMatcher = (
  node: t.TemplateElement[],
  results: t.SourceLocation[] = [],
): t.SourceLocation[] => {
  const nextToken = node.shift();
  if (!nextToken) return results;

  if (nextToken.loc) {
    results.push(nextToken.loc);
  }

  return templateExpressionMatcher(node, results);
};
