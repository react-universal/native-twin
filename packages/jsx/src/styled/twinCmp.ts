import { ComponentType } from 'react';
import type { ComponentConfig } from '../types/styled.types';
import { useComponentState } from './hooks/useComponentState';
import { renderTwinComponent } from './renderComponent';

export function twinComponent(
  component: ComponentType<any>,
  configs: ComponentConfig[],
  props: Record<string, any> | null,
  ref: any,
) {
  const { styledProps, componentHandlerRef } = useComponentState(configs, props);

  props = Object.assign({ ref }, props);
  for (const x of componentHandlerRef.current.propStates) {
    if (x.target !== x.source) {
      delete props[x.source];
    }
  }
  Object.assign(props, styledProps);

  return renderTwinComponent(component, componentHandlerRef.current, props);
}
