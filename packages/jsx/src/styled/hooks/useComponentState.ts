import { useContext, useRef, useSyncExternalStore } from 'react';
import { groupContext } from '../../context';
import { StyledComponentHandler } from '../../store/component.store';
import { ComponentConfig } from '../../types/styled.types';

export function useComponentState(
  configs: ComponentConfig[],
  props: Record<string, any> | null,
) {
  const getChildStyles = useContext(groupContext);
  const componentHandlerRef = useRef(new StyledComponentHandler(configs, props));

  const styledProps = useSyncExternalStore(componentHandlerRef.current.subscribe, () => {
    componentHandlerRef.current.receiveProps(props);
    return componentHandlerRef.current.configStyles;
  });

  return {
    styledProps: styledProps,
    componentHandlerRef: componentHandlerRef,
    getChildStyles,
  };
}
