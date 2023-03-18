import type { Touchable } from 'react-native';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useStore } from './useStore';

const useStyledComponent = (
  {
    className,
    children,
    tw,
    Component,
    parentID,
    style,
    isFirstChild,
    isLastChild,
    nthChild,
    baseClassNameOrOptions,
    ...componentProps
  }: any,
  ref: any,
) => {
  if (typeof baseClassNameOrOptions === 'string') {
  } else {
  }
  const baseClassName =
    typeof baseClassNameOrOptions === 'string' ? baseClassNameOrOptions : '';
  const component = useStore({
    className: `${className} ${baseClassName}` ?? `${tw} ${baseClassName}` ?? baseClassName,
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

  const element = (
    <Component
      {...componentProps}
      {...componentInteractionHandlers}
      style={[component.styles, style]}
      key={component.id}
      forwardedRef={ref}
      ref={ref}
    >
      {componentChilds}
    </Component>
  );

  return element;
};

export { useStyledComponent };
