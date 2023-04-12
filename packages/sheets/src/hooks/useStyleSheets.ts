import { useMemo } from 'react';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
import {
  registerComponentInStore,
  composeComponentStyledProps,
} from '../store/components.handlers';
import { globalStore } from '../store/global.store';
import type { IUseStyleSheetsInput } from '../types';
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

  const { styledProps } = useClassNamesToCss(className ?? '', classPropsTuple ?? []);

  const currentGroupID = useMemo(() => {
    return groupID ? groupID : parentID ?? 'non-group';
  }, [parentID, groupID]);

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
        classNames: className ?? '',
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

  const composedStyles = useMemo(() => {
    return composeComponentStyledProps(component);
  }, [component]);

  return {
    styledProps,
    componentID,
    component,
    hasGroupInteractions: component.meta.hasGroupInteractions,
    hasPointerInteractions: component.meta.hasPointerInteractions,
    isGroupParent: component.meta.isGroupParent,
    interactionStyles: component.styleSheet.interactionStyles,
    currentComponentGroupID: currentGroupID,
    composedStyles,
  };
}

export { useComponentStyleSheets };
