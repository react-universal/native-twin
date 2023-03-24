import type { Touchable } from 'react-native';
import {
  IExtraProperties,
  TInternalStyledComponentProps,
  useComponentStyleSheets,
} from '@universal-labs/stylesheets';
import type { StyledOptions, StyledProps } from '../types/styled.types';
import { useBuildStyleProps } from './useBuildStyleProps';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';

const useStaticStyledComponent = <T, C extends keyof T>(
  componentProps: StyledProps<IExtraProperties<TInternalStyledComponentProps>>,
  styledOptions?: StyledOptions<T, C>,
) => {
  const classProps = useBuildStyleProps(componentProps, styledOptions);
  const { styleProps, component, componentID, interactionsMeta } = useComponentStyleSheets({
    classProps,
    inlineStyles: componentProps.style,
    isFirstChild: componentProps.isFirstChild,
    isLastChild: componentProps.isLastChild,
    nthChild: componentProps.nthChild,
    parentID: componentProps.parentID,
  });
  const { componentInteractionHandlers } = useComponentInteractions({
    props: componentProps as Touchable,
    component: {
      hasGroupInteractions: interactionsMeta.hasGroupInteractions,
      hasPointerInteractions: interactionsMeta.hasPointerInteractions,
      isGroupParent: interactionsMeta.isGroupParent,
      id: componentID,
    },
  });
  const componentChilds = useChildren(componentProps.children, component?.id);
  return {
    componentChilds,
    componentInteractionHandlers,
    styleProps,
  };
};

export { useStaticStyledComponent };
