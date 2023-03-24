/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import {
  globalStore,
  IUseStyleSheetsInput,
  registerComponent,
  unregisterComponent,
} from '../store/global.store';
import type { IComponentInteractions, TInteractionPseudoSelectors } from '../types';

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
  }, [inlineStyles, isFirstChild, isLastChild, nthChild, parentID]);

  const component = useSyncExternalStore(
    globalStore.subscribe,
    () => globalStore.getState().components[componentID],
    () => globalStore.getState().components[componentID],
  );

  const getInteractionStyles = useCallback(
    (
      classProp: string,
      interaction: TInteractionPseudoSelectors,
    ): IComponentInteractions | undefined => {
      if (!component?.styleSheets[classProp]) return undefined;
      return component?.styleSheets[classProp]?.styles.interactionStyles.find(
        ([name]) => name === interaction,
      );
    },
    [component?.styleSheets],
  );

  const styleProps = useMemo(() => {
    const propStyles = {};
    let hasGroupInteractions = false;
    let hasPointerInteractions = false;
    let isGroupParent = false;
    if (!component?.styleSheets) {
      return {
        propStyles,
        meta: {
          hasGroupInteractions,
          hasPointerInteractions,
          isGroupParent,
        },
      };
    }
    Object.keys(classProps).forEach((propName) => {
      const currentStyle = component.styleSheets[propName];
      if (currentStyle) {
        if (currentStyle.styles.interactionStyles.length > 0) {
          hasPointerInteractions = true;
        }
        if (currentStyle.styles.classNameSet.has('group')) {
          isGroupParent = true;
        }
        if (currentStyle.styles.interactionStyles.some(([name]) => name.includes('group-'))) {
          hasGroupInteractions = true;
        }
        Object.assign(propStyles, {
          [propName]: currentStyle.styles.baseStyles,
        });
        const hoverStyle = getInteractionStyles(propName, 'hover');
        if (hoverStyle && hoverStyle.length > 0 && component.interactionsState.hover) {
          Object.assign(propStyles, {
            [propName]: {
              ...propStyles[propName],
              ...hoverStyle[1].styles,
            },
          });
        }
        const groupHoverStyle = getInteractionStyles(propName, 'group-hover');
        if (
          groupHoverStyle &&
          groupHoverStyle.length > 0 &&
          component.interactionsState['group-hover']
        ) {
          Object.assign(propStyles, {
            [propName]: {
              ...propStyles[propName],
              ...groupHoverStyle[1].styles,
            },
          });
        }
      }
    });
    return {
      propStyles,
      meta: {
        hasGroupInteractions,
        hasPointerInteractions,
        isGroupParent,
      },
    };
  }, [classProps, component?.styleSheets, component?.interactionsState, getInteractionStyles]);

  useEffect(() => {
    return () => unregisterComponent(componentID);
  }, [componentID]);

  return {
    interactionsMeta: styleProps.meta,
    componentID,
    component,
    getInteractionStyles,
    styleProps: styleProps.propStyles,
  };
}

export { useComponentStyleSheets };
