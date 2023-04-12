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
  console.time(`useBuildStyledComponent: ${props.className}`);
  const { className, classPropsTuple } = useBuildStyleProps(props, styleClassProps);

  const {
    componentID,
    composedStyles,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    component,
    currentComponentGroupID,
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

  const componentChilds = useChildren(
    props.children,
    componentID,
    component.styleSheet.getChildStyles,
    currentComponentGroupID === 'non-group'
      ? props.groupID ?? props.parentID ?? ''
      : currentComponentGroupID,
  );
  console.timeEnd(`useBuildStyledComponent: ${props.className}`);
  return {
    componentChilds,
    componentInteractionHandlers,
    focusHandlers,
    composedStyles,
  };
}

export { useBuildStyledComponent };
