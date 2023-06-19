import { useMemo } from 'react';
import { Touchable, StyleSheet } from 'react-native';
import {
  StyledProps,
  createComponentID,
  InlineStyleSheet,
  StoreManager,
  AnyStyle,
} from '@universal-labs/stylesheets';
import { ComponentNode } from '@universal-labs/stylesheets';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';

const defaultGroupState = Object.freeze({
  active: false,
  focus: false,
  hover: false,
  'group-active': false,
  'group-focus': false,
  'group-hover': false,
});

function useBuildStyledComponent<T>({
  className,
  groupID,
  parentID,
  style,
  tw,
  children,
  ...restProps
}: StyledProps<T>) {
  const stylesheet = useMemo(() => {
    return new InlineStyleSheet(className ?? tw ?? '');
  }, [className, tw]);

  const componentID = useMemo(() => createComponentID() as string, []);

  const currentGroupID = useMemo(() => {
    return groupID ? groupID : parentID ?? componentID;
  }, [parentID, groupID, componentID]);
  const component = useMemo(
    () =>
      StoreManager.registerComponentInStore(
        new ComponentNode({
          componentID,
          stylesheetID: stylesheet.id,
          groupID: stylesheet.metadata.isGroupParent ? componentID : currentGroupID,
        }),
      )!,
    [componentID, stylesheet, currentGroupID],
  );

  const interactionState = useSyncExternalStoreWithSelector(
    StoreManager.subscribe,
    () => component.interactionsState,
    () => component.interactionsState,
    (record) => {
      return record;
    },
  );

  const groupScope = currentGroupID === componentID ? componentID : currentGroupID;

  const groupParentComponentState = useSyncExternalStoreWithSelector(
    StoreManager.subscribe,
    () => StoreManager.componentsRegistry.get(groupScope)!.interactionsState,
    () => StoreManager.componentsRegistry.get(groupScope)!.interactionsState,
    (parent) => {
      if (
        currentGroupID !== componentID &&
        (stylesheet.metadata.hasGroupEvents || stylesheet.metadata.isGroupParent)
      ) {
        return parent;
      }
      return defaultGroupState;
    },
  );

  const { componentInteractionHandlers, focusHandlers } = useComponentInteractions({
    props: restProps as Touchable,
    hasGroupInteractions: stylesheet.metadata.hasGroupEvents,
    hasPointerInteractions: stylesheet.metadata.hasPointerEvents,
    isGroupParent: stylesheet.metadata.isGroupParent,
    id: componentID,
  });

  const componentChilds = useChildren(
    children,
    componentID,
    stylesheet.metadata.isGroupParent ? componentID : currentGroupID,
    stylesheet.getChildStyles,
  );

  const componentStyles = useMemo(() => {
    const styles: AnyStyle = stylesheet.getStyles({
      isParentActive:
        groupParentComponentState.active ||
        groupParentComponentState.focus ||
        groupParentComponentState.hover,
      isPointerActive:
        interactionState.active || interactionState.focus || interactionState.hover,
    });
    return StyleSheet.create({
      generated: {
        ...styles,
        ...style,
      },
    }).generated;
  }, [interactionState, stylesheet, groupParentComponentState, style]);

  return {
    componentInteractionHandlers,
    focusHandlers,
    componentStyles,
    componentChilds,
    groupID,
    parentID,
    component,
    currentGroupID,
  };
}

export { useBuildStyledComponent };
