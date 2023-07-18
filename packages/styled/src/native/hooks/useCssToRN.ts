import { useCallback, useId, useMemo, useSyncExternalStore } from 'react';
import { SheetManager } from '../sheet';
import {
  GlobalStore,
  getParentComponentState,
  globalStore,
  registerComponent,
} from '../store';

export function useCssToRN({
  className,
  groupID,
  parentID,
}: {
  className: string;
  groupID?: string | undefined;
  parentID?: string | undefined;
}) {
  const componentID = useId();

  const context = useSyncExternalStore(
    globalStore.subscribe,
    () => globalStore.getState().context,
  );

  const currentGroupID = useMemo(() => {
    return groupID ? groupID : parentID ?? componentID;
  }, [groupID, parentID, componentID]);

  const groupScope = currentGroupID === componentID ? componentID : currentGroupID;

  const stylesheet = useMemo(() => {
    const manager = SheetManager(context);
    const result = manager(className);
    return result;
  }, [className, context]);

  const component = useSyncExternalStore(globalStore.subscribe, () =>
    registerComponent({
      groupID: stylesheet.metadata.isGroupParent ? componentID : currentGroupID,
      id: componentID,
    }),
  );

  const parentComponent = useSyncExternalStore(globalStore.subscribe, () =>
    getParentComponentState(groupScope),
  );

  return { stylesheet, componentID, component, parentComponent, currentGroupID };
}

export function useStore<T>(fn: (store: GlobalStore) => T) {
  return useSyncExternalStore(
    globalStore.subscribe,
    useCallback(() => fn(globalStore.getState()), [fn]),
  );
}
