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

const useStyledComponent = <T, P extends keyof T>(
  props: StyledProps<IExtraProperties<TInternalStyledComponentProps>>,
  styledOptions?: StyledOptions<T, P>,
) => {
  const classProps = useBuildStyleProps(props, styledOptions);
  const { styleProps, component, componentID, interactionsMeta } = useComponentStyleSheets({
    classProps,
    inlineStyles: props.style,
    isFirstChild: props.isFirstChild,
    isLastChild: props.isLastChild,
    nthChild: props.nthChild,
    parentID: props.parentID,
  });
  const { componentInteractionHandlers } = useComponentInteractions({
    props: props as Touchable,
    component: {
      hasGroupInteractions: interactionsMeta.hasGroupInteractions,
      hasPointerInteractions: interactionsMeta.hasPointerInteractions,
      isGroupParent: interactionsMeta.isGroupParent,
      id: componentID,
    },
  });
  const componentChilds = useChildren(props.children, component?.id);
  return {
    componentChilds,
    componentInteractionHandlers,
    styleProps,
  };
};

export { useStyledComponent };
