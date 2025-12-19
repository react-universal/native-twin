import * as Array from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import ts from 'ts-morph';
import { ScriptElementKind } from 'typescript';
import { LSPParser } from '../core/LSPParser.service';
import { LSPParserError } from '../models/LSP.models';
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

  const parseConfigFile = Effect.fn('TS.parseConfigFile')(function* (
    filename: string,
    code: string,
  ) {
    const tsSource = yield* program.getSourceFile(filename, code);

    const twinCoreImport = tsSource.getImportDeclaration('@native-twin/core');
    if (!twinCoreImport) return yield* LSPParserError.create('Not a valid identifier');
    const defineConfigImport = twinCoreImport
      .getNamedImports()
      .find((x) => x.getName() === 'defineConfig');
    if (!defineConfigImport) return yield* LSPParserError.create('Not a valid identifier');

    const nameNode = defineConfigImport.getNameNode();
    if (!ts.Node.isIdentifier(nameNode))
      return yield* LSPParserError.create('Not a valid identifier');
    const result = yield* Stream.fromIterable(nameNode.findReferencesAsNodes()).pipe(
      Stream.filterMap(Option.liftNullable((_: ts.Node<ts.ts.Node>) => _.getParent())),
      Stream.filterMap(Option.liftPredicate(ts.Node.isCallExpression)),
      Stream.filterMap((x) => Array.head(x.getArguments())),
      Stream.filterMap(Option.liftPredicate(ts.Node.isObjectLiteralExpression)),
      Stream.map((x) => x.getProperties()),
      Stream.flattenIterables,
      Stream.filterMap(Option.liftPredicate(ts.Node.isPropertyAssignment)),
      Stream.mapEffect((prop) =>
        Effect.try(() => ({
          name: prop.getName(),
          value: reducePropertyToPrimitive(prop.getInitializer(), program.project),
        })),
      ),
      Stream.either,
      Stream.runCollect,
      Effect.map(Array.fromIterable),
    );

    return result;
  });

  return {
    parseFile,
    parseConfigFile,
  };
}).pipe(Effect.provide(JSXParserLive), Layer.effect(LSPParser));

export function reducePropertyToPrimitive(input: any, project: ts.Project): any {
  switch (input.getKind()) {
    case ts.SyntaxKind.Identifier:
      return resolveIdentifierValue(input, project);
    case ts.SyntaxKind.StringLiteral:
      return input.getText().slice(1, -1); // Remove quotes
    case ts.SyntaxKind.NumericLiteral:
      return parseFloat(input.getText());
    case ts.SyntaxKind.TrueKeyword:
      return true;
    case ts.SyntaxKind.FalseKeyword:
      return false;
    case ts.SyntaxKind.NullKeyword:
      return null;
    case ts.SyntaxKind.UndefinedKeyword:
      return undefined;
    case ts.SyntaxKind.AsExpression:
      return reduceAsExpression(input, project);
    case ts.SyntaxKind.ParenthesizedExpression:
      return reduceParenthesizedExpression(input, project);
    case ts.SyntaxKind.ObjectLiteralExpression:
      return reduceObjectLiteralToPrimitive(input, project);
    case ts.SyntaxKind.ArrayLiteralExpression:
      return reduceArrayLiteralToPrimitive(input, project);
    case ts.SyntaxKind.CallExpression:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
      return resolveCallExpressionValue(input, project);
    case ts.SyntaxKind.ThisKeyword:
      return resolveThisKeyword(input, project);
    case ts.SyntaxKind.PropertyAccessExpression:
      return resolvePropertyAccessExpression(input, project);
    case ts.SyntaxKind.PropertyDeclaration:
    case ts.SyntaxKind.VariableDeclaration:
      const initializer = input.getInitializer();
      if (!initializer) {
        return null;
      }
      return reducePropertyToPrimitive(initializer, project);
    default:
      throw new Error(
        `Unsupported initializer kind: ${input.getKindName()}. For ${input.getText()}`,
      );
  }
}

function reduceKeyToPrimitive(key: any, project: ts.Project) {
  switch (key.getKind()) {
    case ts.SyntaxKind.Identifier:
      return key.getText();
    case ts.SyntaxKind.ComputedPropertyName:
      const expression = key.getExpression();

      return reducePropertyToPrimitive(expression, project);
    case ts.SyntaxKind.StringLiteral:
      // const literal = (key as ts.StringLiteral).(/);

      return reducePropertyToPrimitive(key, project);
    default:
      throw new Error(`Unsupported ObjectLiteral key: ${key.getKindName()}. For ${key.getText()}`);
  }
}

function reduceObjectLiteralToPrimitive(
  objectLiteral: ts.ObjectLiteralExpression,
  project: ts.Project,
): any {
  let result: any = {};
  objectLiteral.getProperties().forEach((prop) => {
    if (prop.getKind() === ts.SyntaxKind.PropertyAssignment) {
      const name = reduceKeyToPrimitive((prop as ts.PropertyAssignment).getNameNode(), project);
      const value = (prop as any).getInitializer();
      result[name] = reducePropertyToPrimitive(value, project);
    }
    if (prop.getKind() === ts.SyntaxKind.SpreadAssignment) {
      const spreadAssignment = prop as ts.SpreadAssignment;
      const expression = spreadAssignment.getExpression();
      const spreadObject = reducePropertyToPrimitive(expression, project);
      result = { ...result, ...spreadObject };
    }
  });
  return result;
}

function reduceAsExpression(asExpression: ts.AsExpression, project: ts.Project): any {
  const expression = asExpression.getExpression();
  return reducePropertyToPrimitive(expression, project);
}

function reduceParenthesizedExpression(
  parenthesizedExpression: ts.ParenthesizedExpression,
  project: ts.Project,
): any {
  const expression = parenthesizedExpression.getExpression();
  return reducePropertyToPrimitive(expression, project);
}

function reduceArrayLiteralToPrimitive(
  arrayLiteral: ts.ArrayLiteralExpression,
  project: ts.Project,
): any[] {
  return arrayLiteral.getElements().map((element) => reducePropertyToPrimitive(element, project));
}

function resolveIdentifierValue(identifier: ts.Identifier, project: ts.Project): any {
  const definition = identifier.getDefinitions()[0];

  const sourceFile = project.getSourceFileOrThrow(definition.getSourceFile().getFilePath());

  let variableDeclaration;

  switch (definition.getKind()) {
    case ScriptElementKind.constElement:
    case ScriptElementKind.letElement:
    case ScriptElementKind.variableElement:
      variableDeclaration = sourceFile.getVariableDeclarationOrThrow(identifier.getText());
      const initializer = variableDeclaration.getInitializer();
      // external import probably, can't deal with it
      if (!initializer) {
        return null;
      }

      return reducePropertyToPrimitive(initializer, project);
    case ScriptElementKind.classElement:
    case ScriptElementKind.localClassElement:
      variableDeclaration = sourceFile.getClassOrThrow(identifier.getText());
      return `class ${identifier.getText()}`;
    default:
      throw new Error(
        `Unsupported identifier kind: ${definition.getKind()}. For ${identifier.getText()}`,
      );
  }
}

function resolvePropertyAccessExpression(
  expression: ts.PropertyAccessExpression,
  project: ts.Project,
) {
  const resolvedObject = reducePropertyToPrimitive(expression.getExpression(), project);
  const propertyName = expression.getName();

  if (resolvedObject === null) {
    return null;
  }

  if (resolvedObject && typeof resolvedObject === 'object' && propertyName in resolvedObject) {
    return resolvedObject[propertyName];
  }

  throw new Error(`Property ${propertyName} not found on resolved object.`);
}

function resolveThisKeyword(thisExpression: ts.ThisExpression, project: ts.Project): any {
  const classDeclaration = thisExpression.getFirstAncestorByKind(
    ts.SyntaxKind.ClassDeclaration,
  ) as ts.ClassDeclaration;
  if (!classDeclaration) {
    throw new Error('ThisKeyword used outside of a class.');
  }
  const propertyAccessExpression = thisExpression.getParentIfKind(
    ts.SyntaxKind.PropertyAccessExpression,
  ) as ts.PropertyAccessExpression;
  if (!propertyAccessExpression) {
    throw new Error('Unable to resolve property or method name from ThisKeyword.');
  }

  const propertyName = propertyAccessExpression.getName();
  if (!propertyName) {
    throw new Error('Unable to resolve property or method name from ThisKeyword.');
  }
  const property = getPropertyInInheritance(classDeclaration, propertyName, false, false);
  if (property) {
    const initializer = property.getInitializer();
    if (!initializer) {
      return null;
    }
    return reducePropertyToPrimitive(initializer, project);
  }

  const method = getMethodInInheritance(classDeclaration, propertyName, false, false);
  if (method) {
    const body = method.getBody();
    if (!body) {
      return null;
    }
    const returnStatement = body.getFirstDescendantByKind(ts.SyntaxKind.ReturnStatement);
    if (!returnStatement) {
      return null;
    }
    const expression = returnStatement.getExpression();
    if (!expression) {
      return null;
    }
    return reducePropertyToPrimitive(expression, project);
  }
}

// don't resolve this, there can be too many complexities here, and we don't need it
function resolveCallExpressionValue(
  callExpression: ts.CallExpression,
  _project: ts.Project,
  v = null,
): any {
  // Implement logic to resolve the value of the call expression
  const expression = callExpression.getExpression();
  if (ts.Node.isIdentifier(expression)) {
    const importDcl = expression
      .getSourceFile()
      .getImportDeclaration((x) =>
        x.getNamedImports().some((y) => y.compilerNode.name.text === expression.compilerNode.text),
      );
    if (!importDcl) return v;
    return {
      caller: expression.compilerNode.text,
      source: importDcl.getModuleSpecifier(),
      importBinding: expression.compilerNode.text,
    };
  }
  return v;
}

// generic utils

function getPropInInheritance(
  classDeclaration: ts.ClassDeclaration,
  propertyName: string,
  required = false,
  isStatic = true,
  isMethod = false,
) {
  let property: ts.PropertyDeclaration | ts.MethodDeclaration | undefined;

  if (isMethod) {
    if (isStatic) {
      property = classDeclaration.getStaticMethod(propertyName) as ts.MethodDeclaration;
    } else {
      property = classDeclaration.getInstanceMethod(propertyName);
    }
  } else {
    if (isStatic) {
      property = classDeclaration.getStaticProperty(propertyName) as ts.PropertyDeclaration;
    } else {
      property = classDeclaration.getProperty(propertyName);

      if (!property) {
        property = getPropertyFromConstructor(classDeclaration, propertyName);
      }
    }
  }

  if (!property) {
    const baseClass = classDeclaration.getBaseClass();

    if (!baseClass) {
      if (required) {
        throw new Error(
          `Could not find required static ${propertyName}. You need to define it in every resource or a parent abstract resource`,
        );
      } else {
        return null;
      }
    }

    return getPropInInheritance(baseClass, propertyName, required, isStatic, isMethod);
  }

  return property;
}

export function getPropertyInInheritance(
  classDeclaration: ts.ClassDeclaration,
  propertyName: string,
  required = false,
  isStatic = true,
): ts.PropertyDeclaration | null {
  return getPropInInheritance(
    classDeclaration,
    propertyName,
    required,
    isStatic,
    false,
  ) as ts.PropertyDeclaration | null;
}

export function getMethodInInheritance(
  classDeclaration: ts.ClassDeclaration,
  propertyName: string,
  required = false,
  isStatic = true,
): ts.MethodDeclaration | null {
  return getPropInInheritance(
    classDeclaration,
    propertyName,
    required,
    isStatic,
    true,
  ) as ts.MethodDeclaration | null;
}

export function getPropertyFromConstructor(
  classDeclaration: ts.ClassDeclaration,
  propertyName: string,
): any | null {
  const constructor = classDeclaration.getConstructors()[0];
  if (!constructor) {
    return null;
  }

  // Check constructor body for property assignments
  const statements = (constructor.getBody() as any)?.getStatements() || [];

  for (const statement of statements) {
    if (statement.getKind() === ts.SyntaxKind.ExpressionStatement) {
      const expression = statement.asKind(ts.SyntaxKind.ExpressionStatement)?.getExpression();
      if (expression?.getKind() === ts.SyntaxKind.BinaryExpression) {
        const binaryExpression = expression.asKind(ts.SyntaxKind.BinaryExpression);
        const left = binaryExpression?.getLeft().getText();
        if (left === `this.${propertyName}`) {
          return binaryExpression?.getRight();
        }
      }
    }
  }

  return null;
}
