import { ComponentType, ForwardedRef, forwardRef, ForwardRefExoticComponent } from 'react';
import { useBuildStyledComponent } from '../hooks/useBuildStyledComponent';
import type { StyledProps } from '../types/styled.types';

type PropsFrom<TComponent> = TComponent extends React.FC<infer Props>
  ? Props
  : TComponent extends React.ComponentType<infer Props>
  ? Props
  : never;

export type ForwardedStyledComponent<Component> = ForwardRefExoticComponent<
  PropsFrom<Component> & StyledProps<{}>
>;

export function styled<T>(
  Component: ComponentType<T>,
): ForwardedStyledComponent<typeof Component> {
  function Styled(
    {
      isFirstChild,
      isLastChild,
      nthChild,
      children,
      className,
      groupID,
      parentID,
      style,
      tw,
      ...restProps
    }: StyledProps<any>,
    ref: ForwardedRef<any>,
  ) {
    const { componentChilds, componentInteractionHandlers, focusHandlers, componentStyles } =
      useBuildStyledComponent({
        isFirstChild,
        isLastChild,
        nthChild,
        children,
        className,
        groupID,
        parentID,
        style,
        tw,
        ...restProps,
      });
    return (
      <Component
        style={componentStyles}
        ref={ref}
        {...focusHandlers}
        {...restProps}
        {...componentInteractionHandlers}
      >
        {componentChilds}
      </Component>
    );
  }
  Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;

  return forwardRef(Styled) as any;
}
