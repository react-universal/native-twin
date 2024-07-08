import { ComponentType, createElement } from 'react';
import { groupContext } from '../context';
import type { ComponentConfig } from '../types/styled.types';
import { getComponentType } from '../utils/react.utils';
import { useStyledProps } from './hooks/useStyledContext';
import { useTwinComponent } from './hooks/useTwinComponent';

export function twinComponent(
  baseComponent: ComponentType<any>,
  configs: ComponentConfig[],
  props: Record<string, any> | null,
  ref: any,
) {
  let component = baseComponent;

  const { styles, colorTheme } = useStyledProps(props);
  const { state, parentState, onChange, id } = useTwinComponent(styles);

  props = Object.assign({ ref }, props);

  if (styles.length > 0) {
    for (const style of styles) {
      props[style[0]] = Object.assign(
        style[1].getStyles(
          {
            isParentActive: parentState.isGroupActive,
            isPointerActive: state.interactions.isLocalActive,
          },
          colorTheme,
        ),
        { ...props[style[0]] } ?? {},
      );
    }
    // if (styledProps.length > 0) {
    //   console.log('STYLED_PROPS: ', styledProps);
    // }
  }

  for (const x of configs) {
    if (x.target !== x.source) {
      delete props[x.source];
    }
  }

  if (state.meta.hasPointerEvents || state.meta.hasGroupEvents) {
    props['onTouchStart'] = (event: unknown) => {
      ref?.['onTouchStart']?.(event);
      onChange(true);
    };
    props['onTouchEnd'] = (event: unknown) => {
      ref?.['onTouchEnd']?.(event);
      onChange(false);
    };
  }

  if (state.meta.isGroupParent) {
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
