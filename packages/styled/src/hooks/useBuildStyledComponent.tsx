import type { Touchable } from 'react-native';
import { useComponentStyleSheets, StyledProps } from '@universal-labs/stylesheets';
import { useBuildStyleProps } from './useBuildStyleProps';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useRenderCounter } from './useRenderCounter';

function useBuildStyledComponent<T, P extends keyof T>(
  props: StyledProps<T>,
  styleClassProps?: P[],
) {
  useRenderCounter();
  const { className, classPropsTuple } = useBuildStyleProps(props, styleClassProps);

  const {
    componentID,
    composedStyles,
    hasGroupInteractions,
    hasPointerInteractions,
    composedStyledProps,
    isGroupParent,
  } = useComponentStyleSheets({
    groupID: props.groupID,
    className,
    classPropsTuple,
    inlineStyles: props.style,
    isFirstChild: props.isFirstChild,
    isLastChild: props.isLastChild,
    nthChild: props.nthChild,
    parentID: props.parentID,
  });

  const { componentInteractionHandlers, focusHandlers } = useComponentInteractions({
    props: props as Touchable,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    id: componentID,
  });

  const componentChilds = useChildren(props.children, componentID);
  // console.timeEnd('useBuildStyledComponent');
  return {
    componentChilds,
    componentInteractionHandlers,
    focusHandlers,
    composedStyles,
    composedStyledProps,
  };
}

export { useBuildStyledComponent };
