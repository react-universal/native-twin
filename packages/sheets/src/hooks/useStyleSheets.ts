import { useCallback, useMemo } from 'react';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
import { componentGroupsStore, registerGroupInStore } from '../store/componentGroups.store';
import {
  componentsStore,
  composeComponentStyledProps,
  composeStylesForPseudoClasses,
  registerComponentInStore,
} from '../store/components.store';
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
  const currentGroupID = isGroupParent ? componentID : groupID ?? 'non-group';
  const component = useSyncExternalStoreWithSelector(
    componentsStore.subscribe,
    () => componentsStore[componentID],
    () => componentsStore[componentID],
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
  const componentGroup = useSyncExternalStoreWithSelector(
    componentGroupsStore.subscribe,
    () => (groupID ? componentGroupsStore[currentGroupID] : {}),
    () => (groupID ? componentGroupsStore[currentGroupID] : {}),
    () => {
      return registerGroupInStore(currentGroupID, { groupID: currentGroupID });
    },
  );

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
      if (componentGroup && componentGroup.interactionsState && hasGroupInteractions) {
        if (componentGroup.interactionsState.hover) {
          result.push(...composeStylesForPseudoClasses(interactionStyles, 'group-hover'));
        }
        if (componentGroup.interactionsState.focus) {
          result.push(...composeStylesForPseudoClasses(interactionStyles, 'focus'));
        }
        if (componentGroup.interactionsState.active) {
          result.push(...composeStylesForPseudoClasses(interactionStyles, 'active'));
        }
      }
      return result;
    },
    [childStyles, interactionStyles, hasGroupInteractions, componentGroup],
  );

  return {
    styledProps,
    componentID,
    component,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    interactionStyles,
    getChildStyles,
    currentComponentGroupID: isGroupParent ? componentID : groupID,
    composedStyles: composeComponentStyledProps(
      interactionStyles,
      platformStyles,
      appearanceStyles,
      component,
      style,
    ),
  };
}

export { useComponentStyleSheets };
