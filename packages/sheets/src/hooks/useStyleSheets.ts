import { useCallback, useEffect, useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import {
  globalStore,
  IUseStyleSheetsInput,
  registerComponent,
  unregisterComponent,
} from '../store/global.store';
import type { TInteractionPseudoSelectors } from '../types';
import { createComponentID } from '../utils/createComponentID';

function useComponentStyleSheets({
  classProps,
  inlineStyles,
  isFirstChild,
  isLastChild,
  nthChild,
  parentID,
}: IUseStyleSheetsInput) {
  const componentID = useMemo(() => {
    const id = createComponentID() as string;
    registerComponent({
      classProps,
      inlineStyles,
      id,
      isFirstChild,
      isLastChild,
      nthChild,
      parentID,
    });
    return id;
  }, [classProps, inlineStyles, isFirstChild, isLastChild, nthChild, parentID]);

  const component = useSyncExternalStore(
    globalStore.subscribe,
    () => globalStore.getState().components[componentID]!,
    () => globalStore.getState().components[componentID]!,
  );

  console.log('CURRENT_STATE: ', globalStore.getState());

  const styleProps = useMemo(() => {
    const propStyles = {};
    Object.keys(classProps).forEach((propName) => {
      propStyles[propName] = component.styleSheets[propName]?.styles.baseStyles ?? {};
    });
    return propStyles;
  }, [classProps, component.styleSheets]);

  useEffect(() => {
    return () => unregisterComponent(componentID);
  }, [componentID]);

  const getInteractionStyles = useCallback(
    (classProp: string, interaction: TInteractionPseudoSelectors) => {
      return component.styleSheets[classProp]!.styles.interactionStyles.find(
        ([name]) => name === interaction,
      );
    },
    [component.styleSheets],
  );

  const interactionsMeta = useMemo(() => {
    const hasGroupInteractions = false;
    const hasPointerInteractions = false;
    const isGroupParent = false;
    return {
      hasGroupInteractions,
      hasPointerInteractions,
      isGroupParent,
    };
  }, []);

  return {
    interactionsMeta,
    componentID,
    component,
    getInteractionStyles,
    styleProps,
  };
}

export { useComponentStyleSheets };
