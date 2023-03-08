import type { Touchable } from 'react-native';
import type { IExtraProperties, TInternalStyledComponentProps } from '../types/store.types';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
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
