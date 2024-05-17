import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { NativeTwinPluginConfiguration } from '../../types/extension.types';

const matchVariantsObject = (
  properties: t.ObjectExpression['properties'],
  results: t.SourceLocation[] = [],
): t.SourceLocation[] => {
  const nextProperty = properties.shift();
  if (!nextProperty) return results;

  if (t.isObjectProperty(nextProperty)) {
    if (t.isStringLiteral(nextProperty.value)) {
      nextProperty.value.loc && results.push(nextProperty.value.loc);
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

const callExpressionMatcher = (path: NodePath<t.CallExpression>, tags: string[]) => {
  const sources: t.SourceLocation[] = [];
  if (t.isIdentifier(path.node.callee) && tags.includes(path.node.callee.name)) {
    for (const arg of path.node.arguments) {
      if (t.isObjectExpression(arg)) {
        sources.push(...matchVariantsObject(arg.properties));
      }
    }
  }
  return sources;
};

const templateExpressionMatcher = (
  node: t.TemplateElement[],
  results: t.SourceLocation[] = [],
): t.SourceLocation[] => {
  const nextToken = node.shift();
  if (!nextToken) return results;

  nextToken.loc && results.push(nextToken.loc);

  return templateExpressionMatcher(node, results);
};

export const getDocumentLanguageLocations = (
  code: string,
  config: NativeTwinPluginConfiguration,
) => {
  const sourceLocations: t.SourceLocation[] = [];
  try {
    const parsed = parse(code, {
      plugins: ['jsx', 'typescript'],
      sourceType: 'module',
      errorRecovery: true,
    });
    if (parsed) {
      traverse(parsed, {
        CallExpression: (path) => {
          sourceLocations.push(...callExpressionMatcher(path, config.tags));
        },
        TaggedTemplateExpression: (path) => {
          if (t.isIdentifier(path.node.tag) && config.tags.includes(path.node.tag.name)) {
            sourceLocations.push(...templateExpressionMatcher(path.node.quasi.quasis));
          }
        },
        JSXAttribute: (path) => {
          if (
            t.isJSXIdentifier(path.node.name) &&
            config.attributes.includes(path.node.name.name) &&
            path.node.value
          ) {
            if (t.isStringLiteral(path.node.value)) {
              path.node.value.loc && sourceLocations.push(path.node.value.loc);
            }
            if (
              t.isJSXExpressionContainer(path.node.value) &&
              t.isTemplateLiteral(path.node.value.expression)
            ) {
              sourceLocations.push(
                ...templateExpressionMatcher(path.node.value.expression.quasis),
              );
            }
          }
        },
      });
    }

    return sourceLocations;
  } catch {
    return sourceLocations;
  }
};

// export const sourceVisitor = (
//   source: ts.SourceFile,
//   sourceMatchers: Matcher[],
//   onMatch: (node: ts.Node) => void,
// ) => {
//   source.forEachChild(visitNode);

//   function visitNode(node: ts.Node) {
//     // KIND 244
//     if (ts.isExpressionStatement(node)) {
//       node.forEachChild(visitNode);
//     }
//     // KIND 214
//     if (ts.isCallExpression(node)) {
//       node.forEachChild(visitNode);
//     }

//     if (
//       ts.isStringLiteralLike(node) ||
//       ts.isTemplateLiteral(node) ||
//       ts.isNoSubstitutionTemplateLiteral(node)
//     ) {
//       onMatch(node);
//     }

//     node.forEachChild(visitNode);
//   }
// };
