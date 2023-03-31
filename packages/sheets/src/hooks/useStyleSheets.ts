import { useMemo } from 'react';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
import {
  componentsStore,
  composeComponentStyledProps,
  registerComponentInStore,
} from '../store/components.store';
import type { IUseStyleSheetsInput } from '../types';
import { createComponentID } from '../utils/createComponentID';
import { useClassNamesToCss } from './useClassNamesToCss';

function useComponentStyleSheets({
  className,
  classPropsTuple,
  parentID,
}: IUseStyleSheetsInput) {
  const componentID = useMemo(() => createComponentID() as string, []);

  const {
    componentStyles,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    interactionStyles,
  } = useClassNamesToCss(className ?? '', classPropsTuple ?? []);
  const component = useSyncExternalStoreWithSelector(
    componentsStore.subscribe,
    () => componentsStore[componentID],
    () => componentsStore[componentID],
    () => {
      return registerComponentInStore(componentID, parentID);
    },
  );

  const composedStyles = useMemo(
    () => composeComponentStyledProps(interactionStyles, component, componentStyles),
    [interactionStyles, component, componentStyles],
  );

  return {
    componentStyles,
    componentID,
    parentID,
    component,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    interactionStyles,
    composedStyles,
  };
}

export { useComponentStyleSheets };
