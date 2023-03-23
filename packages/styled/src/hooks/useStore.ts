import { useEffect, useMemo } from 'react';
import {
  storeManager,
  registerComponent,
  unregisterComponent,
} from '@universal-labs/stylesheets';
import type { IRegisterComponentArgs } from '@universal-labs/stylesheets';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

function useStore({
  inlineStyles,
  isFirstChild,
  isLastChild,
  classProps,
  nthChild,
  parentID,
  className,
}: IRegisterComponentArgs) {
  const componentID = useMemo(() => {
    return registerComponent({
      inlineStyles,
      isFirstChild,
      isLastChild,
      nthChild,
      parentID,
      className,
      classProps,
    });
  }, [inlineStyles, isFirstChild, isLastChild, nthChild, parentID, className, classProps]);

  useEffect(() => {
    return () => unregisterComponent(componentID);
  }, [componentID]);

  return useSyncExternalStore(
    storeManager.subscribe,
    () => storeManager.getState().components.get(componentID)!,
    () => storeManager.getState().components.get(componentID)!,
  );
}

export { useStore };
