import type { Touchable } from 'react-native';
import { useComponentStyleSheets, StyledProps } from '@universal-labs/stylesheets';
import { useBuildStyleProps } from './useBuildStyleProps';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';

const useStaticStyledComponent = <T, C extends keyof T>(
  componentProps: StyledProps<T>,
  styledOptions?: C[],
) => {
  const { className, classPropsTuple } = useBuildStyleProps(componentProps, styledOptions);
  const { componentID, hasGroupInteractions, hasPointerInteractions, isGroupParent } =
    useComponentStyleSheets({
      className,
      classPropsTuple,
      inlineStyles: componentProps.style,
      isFirstChild: componentProps.isFirstChild,
      isLastChild: componentProps.isLastChild,
      nthChild: componentProps.nthChild,
      parentID: componentProps.parentID,
    });
  const { componentInteractionHandlers } = useComponentInteractions({
    props: componentProps as Touchable,
    id: componentID,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
  });
  const componentChilds = useChildren(componentProps.children, componentID);
  return {
    componentChilds,
    componentInteractionHandlers,
    styleProps: {},
  };
};

export { useStaticStyledComponent };
