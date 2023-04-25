import { useMemo } from 'react';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
import { store } from '../store-manager/StoreManager';
import ComponentNode from '../store/ComponentNode';
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

  useMemo(() => {
    return store.registerComponentInStore(
      new ComponentNode({
        componentID,
        stylesheetID: stylesheet.id,
        groupID: stylesheet.metadata.isGroupParent ? componentID : currentGroupID,
      }),
    );
  }, [componentID, stylesheet.id, currentGroupID, stylesheet.metadata.isGroupParent]);
  // first we need to create a unique ID for this component to look up in the store
  // we use useMemo to ensure that the ID is only created once

  const component = useSyncExternalStoreWithSelector(
    store.subscribe,
    () => store.componentsRegistry,
    () => store.componentsRegistry,
    (record) => {
      return record.get(componentID)!;
    },
  );

  return {
    component,
    stylesheet,
  };
}

export { useComponentStyleSheets };
