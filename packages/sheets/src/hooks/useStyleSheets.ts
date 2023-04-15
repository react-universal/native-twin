import { useMemo } from 'react';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
import { registerComponentInStore } from '../store/components.handlers';
import { globalStore } from '../store/global.store';
import InlineStyleSheet from '../stylesheet/Stylesheet';
import type { IUseStyleSheetsInput } from '../types';

function useComponentStyleSheets({
  className,
  componentID,
  currentGroupID,
}: IUseStyleSheetsInput) {
  const stylesheet = useMemo(() => {
    return new InlineStyleSheet(className);
  }, [className]);

  const registeredComponent = useMemo(() => {
    return registerComponentInStore({
      componentID,
      stylesheetID: stylesheet.id,
      groupID: stylesheet.metadata.isGroupParent ? componentID : currentGroupID,
    });
  }, [componentID, stylesheet.id, currentGroupID, stylesheet.metadata.isGroupParent]);
  // first we need to create a unique ID for this component to look up in the store
  // we use useMemo to ensure that the ID is only created once

  const component = useSyncExternalStoreWithSelector(
    globalStore.subscribe,
    () => globalStore.getState(),
    () => globalStore.getState(),
    (store) => {
      return store.componentsRegistry[registeredComponent.id]!;
    },
  );

  return {
    component,
    stylesheet,
  };
}

export { useComponentStyleSheets };
