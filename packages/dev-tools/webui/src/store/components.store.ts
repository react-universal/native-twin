import { pipe } from 'effect/Function';
import * as MutMap from 'effect/MutableHashMap';
import * as Option from 'effect/Option';
import { RawJSXElementTreeNode } from '@native-twin/css/jsx';
import { createStore } from '@native-twin/helpers';
import { ComponentTreeNodeKey, makeCmpTreeNodeKey } from './cache/componentTree.cache';

export const componentsStore = createStore(
  MutMap.empty<ComponentTreeNodeKey, RawJSXElementTreeNode>(),
);

export const setTreeComponent = (node: RawJSXElementTreeNode) =>
  pipe(
    componentsStore.setState((p) => {
      MutMap.set(p, makeCmpTreeNodeKey(node), node);
      return p;
    }),
    () => getStoredComponentTree(node),
  );

export const getTreeComponentByKey = (key: { id: string; order: number }) =>
  pipe(componentsStore.getState(), MutMap.get(makeCmpTreeNodeKey(key))).pipe(
    Option.getOrNull,
  );

export const getStoredComponentTree = (node: RawJSXElementTreeNode) =>
  pipe(makeCmpTreeNodeKey(node), getTreeComponentByKey);

export const getOrSetTreeComponent = (node: RawJSXElementTreeNode) =>
  pipe(
    makeCmpTreeNodeKey(node),
    getTreeComponentByKey,
    Option.fromNullable,
    Option.map((x) => setTreeComponent(x)),
  );
