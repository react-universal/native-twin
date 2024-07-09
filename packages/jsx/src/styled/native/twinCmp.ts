import { ComponentType, createElement, useDebugValue, useId } from 'react';
import { groupContext } from '../../context';
import { colorScheme } from '../../store/observables/colorScheme.obs';
import type { ComponentConfig } from '../../types/styled.types';
import { getComponentType } from '../../utils/react.utils';
import { useStyledProps } from '../hooks/useStyledProps';

export function twinComponent(
  baseComponent: ComponentType<any>,
  configs: ComponentConfig[],
  props: Record<string, any> | null,
  ref: any,
) {
  let component = baseComponent;
  const id = useId();
  const { state, componentStyles, parentState, onChange } = useStyledProps(
    id,
    configs,
    props,
  );
  useDebugValue({ parentState, state });

  props = Object.assign({ ref }, props);

  if (componentStyles.sheets.length > 0) {
    for (const style of componentStyles.sheets) {
      const oldProps = props[style.prop] ? { ...props[style.prop] } : {};
      props[style.prop] = Object.assign(
        style.getStyles({
          isParentActive: parentState.isGroupActive,
          isPointerActive: state.isLocalActive,
          dark: colorScheme.get() === 'dark',
        }),
        oldProps,
      );
    }
  }

  for (const x of configs) {
    if (x.target !== x.source) {
      delete props[x.source];
    }
  }

  if (
    componentStyles.metadata.hasPointerEvents ||
    componentStyles.metadata.hasGroupEvents
  ) {
    if (!props['onTouchStart']) {
      props['onTouchStart'] = (event: unknown) => {
        ref?.['onTouchStart']?.(event);
        onChange(true);
      };
    }
    if (!props['onTouchEnd']) {
      props['onTouchEnd'] = (event: unknown) => {
        ref?.['onTouchEnd']?.(event);
        onChange(false);
      };
    }
  }

  if (componentStyles.metadata.isGroupParent) {
    props = {
      value: id,
      children: createElement(component, props),
    };
    component = groupContext.Provider;
  }

  if (component === baseComponent) {
    switch (getComponentType(component)) {
      case 'forwardRef': {
        const ref = props['ref'];
        delete props['ref'];
        return (component as any).render(props, ref);
      }
      case 'function':
        return (component as any)(props);
      case 'string':
      case 'object':
      case 'class':
      case 'unknown':
        return createElement(component, props);
    }
  } else {
    return createElement(component, props);
  }
}
