import { Option, pipe } from 'effect';
import * as MutMap from 'effect/MutableHashMap';
import { RawJSXElementTreeNode } from '@native-twin/css/jsx';
import { createStore } from '@native-twin/helpers';
import { ComponentTreeNodeKey, makeCmpTreeNodeKey } from './cache/componentTree.cache';

export const componentsStore = createStore(
  MutMap.empty<ComponentTreeNodeKey, RawJSXElementTreeNode>(),
);

export const setTreeComponent = (node: RawJSXElementTreeNode) =>
  pipe(
    //
    MutMap.set(makeCmpTreeNodeKey(node), node),
    componentsStore.setState,
    () => getStoredComponentTree(node),
  );

export const getTreeComponentByKey = (key: ComponentTreeNodeKey) =>
  pipe(componentsStore.getState(), MutMap.get(key));

export const getStoredComponentTree = (node: RawJSXElementTreeNode) =>
  pipe(makeCmpTreeNodeKey(node), getTreeComponentByKey);

export const getOrSetTreeComponent = (node: RawJSXElementTreeNode) =>
  pipe(
    makeCmpTreeNodeKey(node),
    getTreeComponentByKey,
    Option.orElse(() => setTreeComponent(node)),
  );
