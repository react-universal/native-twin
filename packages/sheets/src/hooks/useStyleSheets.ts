import { useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { componentsStore } from '../store/components.store';
import type { IUseStyleSheetsInput } from '../store/global.store';
import { createComponentID } from '../utils/createComponentID';
import { useClassNamesToCss } from './useClassNamesToCss';

function useComponentStyleSheets({
  className,
  classPropsTuple,
  parentID,
}: IUseStyleSheetsInput) {
  // const { component$, componentID, classNameSet } = useComponentRegistration({
  //   classPropsTuple,
  //   className,
  //   parentID,
  // });
  const componentID = useMemo(() => createComponentID() as string, []);

  const {
    componentStyles,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    interactionStyles,
  } = useClassNamesToCss(className ?? '', classPropsTuple ?? []);
  const component = useSyncExternalStore(
    componentsStore.subscribe,
    () => componentsStore[componentID],
    () => componentsStore[componentID],
  );

  // useInsertionEffect(() => {
  //   componentsStore[componentID] = {
  //     interactionsState: {
  //       'group-hover': false,
  //       active: false,
  //       focus: false,
  //       hover: false,
  //     },
  //   };
  // }, []);

  return {
    componentStyles,
    componentID,
    parentID,
    component,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    interactionStyles,
  };
}

export { useComponentStyleSheets };
