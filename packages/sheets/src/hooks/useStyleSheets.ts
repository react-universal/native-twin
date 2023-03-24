import { useEffect, useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import {
  globalStore,
  IUseStyleSheetsInput,
  registerComponent,
  unregisterComponent,
} from '../store/global.store';

function useComponentStyleSheets({
  classProps,
  inlineStyles,
  isFirstChild,
  isLastChild,
  nthChild,
  parentID,
}: IUseStyleSheetsInput) {
  const componentID = useMemo(() => {
    return registerComponent({
      classProps,
      inlineStyles,
      isFirstChild,
      isLastChild,
      nthChild,
      parentID,
    });
  }, [inlineStyles, isFirstChild, isLastChild, nthChild, parentID, classProps]);

  const component = useSyncExternalStore(
    globalStore.subscribe,
    () => globalStore.getState().components[componentID],
    () => globalStore.getState().components[componentID],
  );

  useEffect(() => {
    return () => unregisterComponent(componentID);
  }, [componentID]);

  return {
    componentID,
    component,
  };
}

export { useComponentStyleSheets };
