import type { Touchable } from 'react-native';
import type {
  IExtraProperties,
  TInternalStyledComponentProps,
} from '@universal-labs/stylesheets';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useStore } from './useStore';

const useStyledComponent = (
  {
    className,
    children,
    tw,
    parentID,
    style,
    isFirstChild,
    isLastChild,
    nthChild,
    ...componentProps
  }: IExtraProperties<TInternalStyledComponentProps>,
  baseClassNameOrOptions: string = '',
) => {
  const component = useStore({
    className:
      `${className} ${baseClassNameOrOptions}` ??
      `${tw} ${baseClassNameOrOptions}` ??
      baseClassNameOrOptions,
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
