import { useCallback, useMemo } from 'react';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
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
  const component = useSyncExternalStoreWithSelector(
    componentsStore.subscribe,
    () => componentsStore[componentID],
    () => componentsStore[componentID],
    () => {
      return registerComponentInStore(componentID, {
        parentID,
        isFirstChild,
        isLastChild,
        nthChild,
      });
    },
  );

  const getChildStyles = useCallback(
    (meta: { isFirstChild: boolean; isLastChild: boolean; nthChild: number }) => {
      const result: IStyleType[] = [];
      if (meta.isFirstChild) {
        result.push(...composeStylesForPseudoClasses(childStyles, 'first'));
      }
      return result;
    },
    [childStyles],
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
