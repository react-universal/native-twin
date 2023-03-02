import { useDebugValue } from 'react';
import type { Touchable } from 'react-native';
import type { IExtraProperties } from '../types/styles.types';
import { useComponentInteractions, useComponentState } from './styled';
import { useChildren } from './useChildren';
import { useStore } from './useStore';

const useStyledComponent = <Props extends Object>({
  className,
  children,
  tw,
  ...componentProps
}: Props & IExtraProperties<Props>) => {
  const component = useStore(className ?? tw ?? '');
  useDebugValue(component);

  const componentState = useComponentState({
    component,
    componentProps,
  });
  const { componentInteractionHandlers } = useComponentInteractions({
    props: componentProps as Touchable,
    componentState,
    isGroupParent: false,
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
