import type { Touchable } from 'react-native';
import type {
  IExtraProperties,
  TInternalStyledComponentProps,
} from '@universal-labs/stylesheets';
import type { StyledOptions } from '../types/styled.types';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useStore } from './useStore';

const useStyledComponent = <T, P extends keyof T, C extends keyof T>(
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
  }: IExtraProperties<TInternalStyledComponentProps>,
  baseClassNameOrOptions?: string | StyledOptions<T, P, C>,
) => {
  if (typeof baseClassNameOrOptions === 'string') {
  } else {
  }
  const baseClassName =
    typeof baseClassNameOrOptions === 'string' ? baseClassNameOrOptions : '';
  const component = useStore({
    className: `${className} ${baseClassName}` ?? `${tw} ${baseClassName}` ?? baseClassName,
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
