import {
  ComponentType,
  createElement,
  ForwardedRef,
  forwardRef,
  ForwardRefExoticComponent,
} from 'react';
import type { PropsFrom, StyledProps } from '../types/styled.types';
import { getComponentDisplayName } from '../utils/getComponentDisplayName';
import { useBuildStyledComponent } from './hooks/useStyledComponent';

export function styled<T>(
  Component: ComponentType<T>,
): ForwardRefExoticComponent<PropsFrom<typeof Component> & StyledProps<{}>> {
  function Styled(props: StyledProps<any>, ref: ForwardedRef<any>) {
    const {
      componentInteractionHandlers,
      focusHandlers,
      componentStyles,
      componentChilds,
      currentGroupID,
    } = useBuildStyledComponent(props);
    const newProps = {
      ...props,
    };
    Reflect.deleteProperty(newProps, 'className');
    // @ts-ignore
    return createElement(Component, {
      ...newProps,
      style: componentStyles,
      ref,
      children: componentChilds,
      groupID: currentGroupID,
      ...focusHandlers,
      ...componentInteractionHandlers,
    });
  }
  Styled.displayName = `StyledTW.${getComponentDisplayName(Component)}`;

  return forwardRef(Styled) as any;
}
