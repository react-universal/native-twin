import { parse } from '@babel/parser';
import type { ParseResult } from '@babel/parser';
import traverse, { type Binding } from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import type { AnyPrimitive } from '@native-twin/helpers';
import { Tree, TreeNode } from '@native-twin/helpers/tree';
import type { JSXElementNodePath, JSXElementTree } from '../models/jsx.models';
import * as babelPredicates from '../utils/babel.predicates';

export const createPrimitiveExpression = <T extends AnyPrimitive>(value: T) => {
  if (typeof value === 'string') return t.stringLiteral(value);
  if (typeof value === 'number') return t.numericLiteral(value);
  return t.booleanLiteral(value);
};

export const createRequireExpression = (path: string) => {
  return t.callExpression(t.identifier('require'), [t.stringLiteral(path)]);
};

export const templateLiteralToStringLike = (literal: t.TemplateLiteral) => {
  const strings = literal.quasis
    .map((x) => (x.value.cooked ? x.value.cooked : x.value.raw))
    .map((x) => x.trim().replace(/\n/g, '').trim().replace(/\s+/g, ' '))
    .filter((x) => x.length > 0)
    .join('');
  const expressions = t.templateLiteral(
    literal.quasis.map(() => t.templateElement({ raw: '', cooked: '' })),
    literal.expressions,
  );
  return { strings, expressions: expressions };
};

export const getBabelAST = (code: string, filename: string) =>
  Effect.sync(() =>
    parse(code, {
      sourceFilename: filename,
      plugins: ['jsx', 'typescript'],
      sourceType: 'module',
      errorRecovery: true,
      tokens: false,
      ranges: true,
    }),
  );

export const getAstTrees = (ast: ParseResult<t.File>, filename: string) => {
  return Effect.async<Tree<JSXElementTree>[]>((resolve) => {
    const cssImports: string[] = [];
    traverse(
      ast,
      {
        Program: {
          exit() {
            resolve(Effect.succeed(this.trees));
          },
        },
        ImportDeclaration(path) {
          if (path.node.source.value.endsWith('.css')) {
            cssImports.push(path.node.source.value);
          }
        },
        JSXElement(path) {
          const uid = path.scope.generateUidIdentifier();
          // console.log('UID: ', uid.name, uidUnNamed.name);
          const hash = Hash.string(filename + uid.name);
          const parentTree = new Tree<JSXElementTree>({
            order: -1,
            babelNode: path.node,
            uid: `${hash}__${uid.name}:__1`,
            source: getJSXElementSource(path),
            cssImports: cssImports,
            parentID: null,
          });
          gelBabelJSXElementChildLeaves(path, parentTree.root);
          this.trees.push(parentTree);
          path.skip();
        },
      },
      undefined,
      {
        trees: [] as Tree<JSXElementTree>[],
      },
    );
  });
};

const getJSXElementSource = (path: JSXElementNodePath) =>
  pipe(
    getJSXElementName(path.node.openingElement),
    Option.flatMap((x) => Option.fromNullable(path.scope.getBinding(x))),
    Option.flatMap((binding) => getBindingImportSource(binding)),
    Option.getOrElse(() => ({ kind: 'local', source: 'unknown' })),
  );

const getJSXElementName = (
  openingElement: t.JSXOpeningElement,
): Option.Option<string> => {
  if (t.isJSXIdentifier(openingElement.name)) {
    return Option.some(openingElement.name.name);
  }
  return Option.none();
};

const gelBabelJSXElementChildLeaves = (
  path: JSXElementNodePath,
  parent: TreeNode<JSXElementTree>,
) => {
  const childs = pipe(
    path.get('children'),
    RA.filterMap(Option.liftPredicate(babelPredicates.isJSXElementPath)),
  );

  for (const childPath of childs) {
    const order = parent.childrenCount;
    const childUid = path.scope.generateUid();
    // console.log('CHILD_UID: ', childUid);
    const childLeave = parent.addChild({
      order,
      babelNode: childPath.node,
      uid: `${parent.value.uid}:${order}____${childUid}`,
      source: getJSXElementSource(childPath),
      cssImports: parent.value.cssImports,
      parentID: parent.value.uid,
    });
    childLeave.parent = parent;
    gelBabelJSXElementChildLeaves(childPath, childLeave);
  }
};

const getBindingImportSource = (binding: Binding) =>
  pipe(
    [getBindingImportDeclaration(binding), getBindingRequireDeclaration(binding)],
    Option.firstSomeOf,
  );

const getBindingImportDeclaration = (binding: Binding) =>
  pipe(
    binding.path,
    Option.liftPredicate(babelPredicates.isImportSpecifier),
    Option.bindTo('importSpecifier'),
    Option.bind('importDeclaration', ({ importSpecifier }) =>
      Option.liftPredicate(
        importSpecifier.parentPath,
        babelPredicates.isImportDeclaration,
      ),
    ),
    Option.map((source) => ({
      kind: 'import',
      source: source.importDeclaration.node.source.value,
    })),
  );

const getBindingRequireDeclaration = (binding: Binding) =>
  pipe(
    binding.path,
    Option.liftPredicate(babelPredicates.isVariableDeclaratorPath),
    Option.bindTo('importSpecifier'),
    Option.bind('requireExpression', ({ importSpecifier }) =>
      pipe(
        Option.fromNullable(importSpecifier.node.init),
        Option.flatMap((init) =>
          Option.liftPredicate(init, babelPredicates.isCallExpression),
        ),
        Option.flatMap((x) => RA.head(x.arguments)),
        Option.flatMap((x) => Option.liftPredicate(x, t.isStringLiteral)),
      ),
    ),
    Option.map((source) => {
      return {
        kind: 'require',
        source: source.requireExpression.value,
      };
    }),
  );
