import { useCallback, useMemo } from 'react';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
import {
  registerComponentInStore,
  composeComponentStyledProps,
  composeStylesForPseudoClasses,
} from '../store/components.handlers';
import { globalStore } from '../store/global.store';
import type { IStyleType, IUseStyleSheetsInput } from '../types';
import { createComponentID } from '../utils/createComponentID';
import { useClassNamesToCss } from './useClassNamesToCss';

function useComponentStyleSheets({
  className,
  classPropsTuple,
  parentID,
  groupID,
  isFirstChild,
  isLastChild,
  nthChild,
}: IUseStyleSheetsInput) {
  // first we need to create a unique ID for this component to look up in the store
  // we use useMemo to ensure that the ID is only created once
  const componentID = useMemo(() => createComponentID() as string, []);

  const {
    styledProps,
    style,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    interactionStyles,
    platformStyles,
    childStyles,
    appearanceStyles,
  } = useClassNamesToCss(className ?? '', classPropsTuple ?? []);

  const currentGroupID = useMemo(() => {
    return isGroupParent ? componentID : groupID ?? 'non-group';
  }, [isGroupParent, componentID, groupID]);

  const component = useSyncExternalStoreWithSelector(
    globalStore.subscribe,
    () => globalStore.getState().componentsRegistry.get(componentID),
    () => globalStore.getState().componentsRegistry.get(componentID),
    () => {
      return registerComponentInStore(componentID, {
        groupID: currentGroupID,
        parentID,
        isFirstChild,
        isLastChild,
        nthChild,
      });
    },
  );
  // const componentGroup = useSyncExternalStoreWithSelector(
  //   componentGroupsStore.subscribe,
  //   () => (groupID ? componentGroupsStore[currentGroupID] : {}),
  //   () => (groupID ? componentGroupsStore[currentGroupID] : {}),
  //   () => {
  //     return registerGroupInStore(currentGroupID, { groupID: currentGroupID });
  //   },
  // );

  const getChildStyles = useCallback(
    (meta: { isFirstChild: boolean; isLastChild: boolean; nthChild: number }) => {
      const result: IStyleType[] = [];
      if (meta.isFirstChild) {
        result.push(...composeStylesForPseudoClasses(childStyles, 'first'));
      }
      if (meta.isLastChild) {
        result.push(...composeStylesForPseudoClasses(childStyles, 'last'));
      }
      if (meta.nthChild % 2 === 0) {
        result.push(...composeStylesForPseudoClasses(childStyles, 'even'));
      }
      if (meta.nthChild % 2 !== 0) {
        result.push(...composeStylesForPseudoClasses(childStyles, 'odd'));
      }
      return result;
    },
    [childStyles],
  );

  const composedStyles = useMemo(() => {
    return composeComponentStyledProps(
      interactionStyles,
      platformStyles,
      appearanceStyles,
      component,
      style,
    );
  }, [appearanceStyles, component, interactionStyles, platformStyles, style]);

  return {
    styledProps,
    componentID,
    component,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    interactionStyles,
    getChildStyles,
    currentComponentGroupID: currentGroupID,
    composedStyles,
  };
}

export { useComponentStyleSheets };
