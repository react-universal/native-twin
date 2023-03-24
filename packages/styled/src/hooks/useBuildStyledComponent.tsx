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
import { useRenderCounter } from './useRenderCounter';

function useBuildStyledComponent<T, P extends keyof T>(
  props: StyledProps<IExtraProperties<TInternalStyledComponentProps>>,
  Component: any,
  ref: any,
  styledOptions?: StyledOptions<T, P>,
) {
  useRenderCounter();
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
  const element = (
    <Component
      {...props}
      {...component.getStyleProps}
      {...componentInteractionHandlers}
      ref={ref}
    >
      {componentChilds}
    </Component>
  );

  return element;
}

export { useBuildStyledComponent };
