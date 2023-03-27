import type { Touchable } from 'react-native';
import { useComponentStyleSheets, StyledProps } from '@universal-labs/stylesheets';
import type { StyledOptions } from '../types/styled.types';
import { useBuildStyleProps } from './useBuildStyleProps';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';

const useStyledComponent = <T, P extends keyof T>(
  props: StyledProps<T>,
  styledOptions?: StyledOptions<T, P>,
) => {
  const classProps = useBuildStyleProps(props, styledOptions);
  const { component } = useComponentStyleSheets({
    classProps,
    inlineStyles: props.style,
    isFirstChild: props.isFirstChild,
    isLastChild: props.isLastChild,
    nthChild: props.nthChild,
    parentID: props.parentID,
  });
  const { componentInteractionHandlers } = useComponentInteractions({
    props: props as Touchable,
    componentID: component.id,
    hasGroupInteractions: component.hasPointerInteractions,
    hasPointerInteractions: component.hasPointerInteractions,
    isGroupParent: component.isGroupParent,
  });
  const componentChilds = useChildren(props.children, component?.id);
  return {
    componentChilds,
    componentInteractionHandlers,
    styleProps: component.getStyleProps,
  };
};

export { useStyledComponent };
