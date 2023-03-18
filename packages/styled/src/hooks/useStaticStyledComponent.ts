import type { Touchable } from 'react-native';
import type { IExtraProperties } from '@universal-labs/stylesheets';
import type { StyledOptions } from '../types/styled.types';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useStore } from './useStore';

const useStaticStyledComponent = <T, C extends keyof T>(
  { className, children, tw, style, ...componentProps }: IExtraProperties<T>,
  baseClassNameOrOptions?: StyledOptions<T, C>,
) => {
  const baseClassName =
    typeof baseClassNameOrOptions === 'string' ? baseClassNameOrOptions : '';
  const component = useStore({
    className: `${className} ${baseClassName}` ?? `${tw} ${baseClassName}` ?? baseClassName,
    parentID: 'osidahflsajflasjflsadjfk',
    inlineStyles: style,
    isFirstChild: false,
    isLastChild: false,
    nthChild: 0,
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

export { useStaticStyledComponent };
