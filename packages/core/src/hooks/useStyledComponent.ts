import type { Touchable } from 'react-native';
import type { IExtraProperties, TInternalStyledComponentProps } from '../types/styles.types';
import { useComponentInteractions, useComponentState } from './styled';
import { useChildren } from './useChildren';
import { useStore } from './useStore';

const useStyledComponent = ({
  className,
  children,
  tw,
  parentID,
  style,
  isFirstChild,
  isLastChild,
  nthChild,
  ...componentProps
}: IExtraProperties<TInternalStyledComponentProps>) => {
  const component = useStore({
    className: className ?? tw ?? '',
    parentID,
    inlineStyles: style,
    isFirstChild,
    isLastChild,
    nthChild,
  });

  const componentState = useComponentState({
    component,
    componentProps,
  });
  const { componentInteractionHandlers } = useComponentInteractions({
    props: componentProps as Touchable,
    component,
  });
  const componentChilds = useChildren(children, component);

  return {
    styles: component.styles,
    componentChilds,
    componentState,
    component,
    componentInteractionHandlers,
  };
};

export { useStyledComponent };
