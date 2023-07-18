import { useMemo } from 'react';
import { StyleSheet, Touchable } from 'react-native';
import { AnyStyle } from '@universal-labs/css';
import { StyledProps } from '../../types/styled.types';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useCssToRN } from './useCssToRN';

function useBuildStyledComponent<T>({
  className,
  groupID,
  parentID,
  style,
  tw,
  children,
  ...restProps
}: StyledProps<T>) {
  const { stylesheet, componentID, component, parentComponent, currentGroupID } = useCssToRN({
    className: className ?? tw ?? '',
    groupID,
    parentID,
  });

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
      isParentActive: parentComponent.active || parentComponent.focus || parentComponent.hover,
      isPointerActive:
        component.interactionState.active ||
        component.interactionState.focus ||
        component.interactionState.hover,
    });
    return StyleSheet.create({
      generated: {
        ...styles,
        ...style,
      },
    }).generated;
  }, [component.interactionState, stylesheet, parentComponent, style]);

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
