import { useId, useMemo, useSyncExternalStore } from 'react';
import { StyleSheet, Touchable } from 'react-native';
import { AnyStyle } from '@universal-labs/css';
import { SheetManager } from '../internals/sheet';
import ComponentNode from '../internals/store/ComponentNode';
import { StoreManager } from '../internals/store/StoreManager';
import { StyledProps } from '../types/styled.types';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useStyledContext } from './useStyledContext';

function useBuildStyledComponent<T>({
  className,
  groupID,
  parentID,
  style,
  tw,
  children,
  ...restProps
}: StyledProps<T>) {
  const context = useStyledContext();
  const stylesheet = useMemo(() => {
    const manager = SheetManager(context);
    return manager(className ?? tw ?? '');
  }, [className, tw, context]);

  const componentID = useId();

  const currentGroupID = useMemo(() => {
    return groupID ? groupID : parentID ?? componentID;
  }, [parentID, groupID, componentID]);
  const component = useMemo(
    () =>
      StoreManager.registerComponentInStore(
        new ComponentNode({
          componentID,
          stylesheetID: componentID,
          groupID: stylesheet.metadata.isGroupParent ? componentID : currentGroupID,
        }),
      )!,
    [componentID, stylesheet, currentGroupID],
  );

  const interactionState = useSyncExternalStore(
    StoreManager.subscribe,
    () => component.interactionsState,
    () => component.interactionsState,
  );

  const groupScope = currentGroupID === componentID ? componentID : currentGroupID;

  const groupParentComponentState = useSyncExternalStore(
    StoreManager.subscribe,
    () => StoreManager.componentsRegistry.get(groupScope)!.interactionsState,
    () => StoreManager.componentsRegistry.get(groupScope)!.interactionsState,
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
    // console.log('STYLES: ', styles);
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
