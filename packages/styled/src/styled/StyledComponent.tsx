import {
  ComponentType,
  createElement,
  ForwardedRef,
  forwardRef,
  ForwardRefExoticComponent,
} from 'react';
import { useBuildStyledComponent } from '../hooks/useBuildStyledComponent';
import type { StyledProps } from '../types/styled.types';

type PropsFrom<TComponent> = TComponent extends React.FC<infer Props>
  ? Props
  : TComponent extends React.Component<infer Props>
  ? Props
  : TComponent extends React.ComponentType<infer Props>
  ? Props
  : never;

export type ForwardedStyledComponent<Component> = ForwardRefExoticComponent<
  PropsFrom<Component> & StyledProps<{}>
>;

export function styled<T>(
  Component: ComponentType<T>,
): ForwardRefExoticComponent<PropsFrom<typeof Component> & StyledProps<{}>> {
  function Styled(
    {
      isFirstChild,
      isLastChild,
      nthChild,
      className,
      groupID,
      parentID,
      style,
      tw,
      children,
      ...restProps
    }: StyledProps<any>,
    ref: ForwardedRef<any>,
  ) {
    const start = performance.now();
    const {
      componentInteractionHandlers,
      focusHandlers,
      componentStyles,
      componentChilds,
      currentGroupID,
    } = useBuildStyledComponent({
      isFirstChild,
      isLastChild,
      nthChild,
      className,
      groupID,
      parentID,
      style,
      tw,
      children,
      ...restProps,
    });
    console.debug('TOOK: ', className, performance.now() - start);
    // @ts-ignore
    return createElement(Component, {
      style: componentStyles,
      ref,
      children: componentChilds,
      parentID,
      groupID: currentGroupID,
      ...focusHandlers,
      ...componentInteractionHandlers,
      ...restProps,
    });
  }
  Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;

  return forwardRef(Styled) as any;
}
