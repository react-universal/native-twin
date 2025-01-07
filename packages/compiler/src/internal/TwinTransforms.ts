import type { NodePath } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import traverse, { visitors, type Visitor } from '@babel/traverse';
import type * as t from '@babel/types';
import { Tree, type TreeNode } from '@native-twin/helpers/tree';
import { TwinJSXElement } from '../models/JSXElement.model';
import type { NativeTwinPluginConfiguration } from '../shared/compiler.constants.js';

export interface TwinTraversalState {
  extracted: NodePath<t.JSXElement>[];
  config: NativeTwinPluginConfiguration;
}

export const getJSXElementTree = (
  element: NodePath<t.JSXElement>,
): Tree<TwinJSXElement> => {
  const tree = new Tree(new TwinJSXElement(element));
  getJSXElementChilds(tree.root);

  return tree;
  function getJSXElementChilds(parent: TreeNode<TwinJSXElement>) {
    for (const child of parent.value.childs) {
      const childLeave = parent.addChild(new TwinJSXElement(child, parent.value), parent);
      getJSXElementChilds(childLeave);
    }
  }
};

/**
 * ############################
 * ###### BABEL VISITORS ######
 * ############################
 */

const createBabelVisitors = (...twinVisitors: Visitor<TwinTraversalState>[]) =>
  // @ts-expect-error
  visitors.merge(twinVisitors, traverse.visitors.environmentVisitor);

const AddRootJSXElementPathToState: Visitor<TwinTraversalState> = {
  JSXElement(path) {
    this.extracted.push(path);
    path.skip();
  },
};

const AddStyleSheetImportVisitor: Visitor = {
  Program: {
    exit(path) {
      addNamed(path, 'StyleSheet', '@native-twin/jsx/sheet', {
        importedInterop: 'compiled',
        blockHoist: 1,
        importingInterop: 'babel',
        importedType: 'commonjs',
        importPosition: 'after',
        importedSource: '@native-twin/jsx/sheet',
        nameHint: '__Twin___StyleSheet',
      });
    },
  },
};

export const TwinVisitors = {
  createBabelVisitors,
  AddRootJSXElementPathToState,
  AddStyleSheetImportVisitor,
};
