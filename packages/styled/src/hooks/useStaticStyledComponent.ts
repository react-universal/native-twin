import type { Touchable } from 'react-native';
import { useComponentStyleSheets, StyledProps } from '@universal-labs/stylesheets';
import { useBuildStyleProps } from './useBuildStyleProps';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';

const useStaticStyledComponent = <T, C extends keyof T>(
  componentProps: StyledProps<T>,
  styledOptions?: C[],
) => {
  const classProps = useBuildStyleProps(componentProps, styledOptions);
  const { component } = useComponentStyleSheets({
    classProps,
    inlineStyles: componentProps.style,
    isFirstChild: componentProps.isFirstChild,
    isLastChild: componentProps.isLastChild,
    nthChild: componentProps.nthChild,
    parentID: componentProps.parentID,
  });
  const { componentInteractionHandlers } = useComponentInteractions({
    props: componentProps as Touchable,
    componentID: component.id,
    hasGroupInteractions: component.hasPointerInteractions,
    hasPointerInteractions: component.hasPointerInteractions,
    isGroupParent: component.isGroupParent,
  });
  const componentChilds = useChildren(componentProps.children, component?.id);
  return {
    componentChilds,
    componentInteractionHandlers,
    styleProps: component.getStyleProps,
  };
};

export { useStaticStyledComponent };
