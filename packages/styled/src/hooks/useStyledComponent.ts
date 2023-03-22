import type { Touchable } from 'react-native';
import type {
  IExtraProperties,
  TInternalStyledComponentProps,
} from '@universal-labs/stylesheets';
import type { StyledOptions, StyledProps } from '../types/styled.types';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useStore } from './useStore';

const useStyledComponent = <T, P extends keyof T>(
  {
    className,
    children,
    tw,
    parentID,
    style,
    isFirstChild,
    isLastChild,
    nthChild,
    ...componentProps
  }: StyledProps<IExtraProperties<TInternalStyledComponentProps>>,
  styledOptions?: StyledOptions<T, P>,
) => {
  const component = useStore({
    className:
      `${className} ${styledOptions?.baseClassName}` ??
      `${tw} ${styledOptions?.baseClassName}` ??
      styledOptions?.baseClassName,
    parentID,
    inlineStyles: style,
    isFirstChild,
    isLastChild,
    nthChild,
  });

  const { componentInteractionHandlers } = useComponentInteractions({
    props: componentProps as Touchable,
    component,
  });
  const componentChilds = useChildren(children, component);

  return {
    styles: component.styles,
    componentChilds,
    component,
    componentInteractionHandlers,
  };
};

export { useStyledComponent };
