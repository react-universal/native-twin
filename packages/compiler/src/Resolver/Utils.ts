import type { ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { Tree, type TreeNode } from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Chunk from 'effect/Chunk';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import { type MappedComponent, mappedComponents } from '../shared/compiler.constants';
import { getBabelBindingImportSource } from '../utils/babel/babel.utils';
import type { ComponentRef, ImportSource, LoadedComponent } from './Models';

export const isLocalImport = (path: string) =>
  path.startsWith('.') || path.startsWith('/');

export const getRootJSXElements = (ast: ParseResult<t.File>) =>
  Stream.async<NodePath<t.JSXElement>>((emit) => {
    traverse(
      ast,
      {
        Program: {
          exit() {
            emit.chunk(Chunk.fromIterable(this.elements)).then(() => emit.end());
          },
        },
        JSXElement(path) {
          this.elements.push(path);
          path.skip();
        },
      },
      undefined,
      {
        elements: [] as NodePath<t.JSXElement>[],
      },
    );
  });

export const getJSXTree = (
  element: NodePath<t.JSXElement>,
  resolveImportPath: (importSource: string) => string,
) => {
  const tree = new Tree<LoadedComponent>({
    babelPath: element,
    ref: resolveRef(element),
  });
  getJSXElementChilds(tree.root);

  return tree;
  function getJSXElementChilds(parent: TreeNode<LoadedComponent>) {
    for (const child of parent.value.babelPath
      .get('children')
      .filter((x) => x.isJSXElement())) {
      const childLeave = parent.addChild(
        {
          babelPath: child,
          ref: resolveRef(child),
        },
        parent,
      );
      getJSXElementChilds(childLeave);
    }
  }

  function resolveRef(node: NodePath<t.JSXElement>): ComponentRef {
    const ref = getComponentRef(node);
    const origin = ref.origin;
    if (isLocalImport(origin.source)) {
      origin.source = resolveImportPath(origin.source);
    }
    return {
      ...ref,
      origin,
    };
  }
};

export const getComponentRef = (babelPath: NodePath<t.JSXElement>): ComponentRef => {
  let elementName = 'Unknown';
  const ident = babelPath.node.openingElement.name;
  if (t.isJSXIdentifier(ident)) {
    elementName = ident.name;
  }
  const binding = Option.fromNullable(babelPath.scope.getBinding(elementName));
  const importSource = Option.flatMap(binding, getBabelBindingImportSource).pipe(
    Option.getOrElse((): ImportSource => ({ kind: 'unknown', source: 'none' })),
  );
  const mapped: MappedComponent = RA.findFirst(
    mappedComponents,
    (x) => x.name === elementName,
  ).pipe(Option.getOrElse(() => ({ name: elementName, config: {} })));

  return {
    elementName,
    mapped,
    origin: {
      kind: importSource.kind,
      source: importSource.source,
    },
  };
};
