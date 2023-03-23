import type { Touchable } from 'react-native';
import type {
  IExtraProperties,
  TInternalStyledComponentProps,
} from '@universal-labs/stylesheets';
import type { StyledOptions, StyledProps } from '../types/styled.types';
import { useBuildStyleProps } from './useBuildStyleProps';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useStore } from './useStore';

const useStyledComponent = <T, P extends keyof T>(
  props: StyledProps<IExtraProperties<TInternalStyledComponentProps>>,
  styledOptions?: StyledOptions<T, P>,
) => {
  const classProps = useBuildStyleProps(props, styledOptions);
  const component = useStore({
    className:
      `${props.className} ${styledOptions?.baseClassName}` ??
      `${props.tw} ${styledOptions?.baseClassName}` ??
      styledOptions?.baseClassName,
    parentID: props.parentID,
    inlineStyles: props.style,
    isFirstChild: props.isFirstChild,
    isLastChild: props.isLastChild,
    nthChild: props.nthChild,
    classProps,
  });
  console.log('COMPONENT: ', component);

  const { componentInteractionHandlers } = useComponentInteractions({
    props: props as Touchable,
    component,
  });
  const componentChilds = useChildren(props.children, component);

  return {
    styles: component.styles,
    componentChilds,
    component,
    componentInteractionHandlers,
  };
};

export { useStyledComponent };
