import { useEffect, useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import {
  globalStore,
  IUseStyleSheetsInput,
  registerComponent,
  unregisterComponent,
} from '../store/global.store';

function useComponentStyleSheets({
  className,
  classPropsTuple,
  inlineStyles,
  isFirstChild,
  isLastChild,
  nthChild,
  parentID,
}: IUseStyleSheetsInput) {
  const componentID = useMemo(() => {
    return registerComponent({
      className,
      classPropsTuple,
      inlineStyles,
      isFirstChild,
      isLastChild,
      nthChild,
      parentID,
    });
  }, [
    inlineStyles,
    isFirstChild,
    isLastChild,
    nthChild,
    parentID,
    classPropsTuple,
    className,
  ]);

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
