import {
  ReactNode,
  useMemo,
  Children,
  isValidElement,
  cloneElement,
  useId,
  forwardRef,
} from 'react';
import { useStore } from '@react-universal/core';
import { isFragment } from 'react-is';
import type { StyledComponentType } from './styled.types';
import { useInteraction } from './use-interaction';
import { useComponentRegistration } from './useComponentRegistration';

const initialComponentState = {
  hover: false,
  active: false,
  focus: false,
};
export type ComponentState = typeof initialComponentState;
export type ComponentStateAction = {
  type: keyof ComponentState;
  value: boolean;
};

export const StyledComponent = forwardRef(useStyled) as StyledComponentType;

export default function useStyled(
  {
    component: Component,
    tw,
    className: propClassName,
    style: inlineStyles,
    children,
    ...componentProps
  }: any,
  ref: unknown,
) {
  const componentID = useId();
  const { styledProps } = useComponentRegistration(componentID, propClassName ?? tw);
  const component = useStore(
    (state) => state.components.registeredComponents.get(componentID)!,
  );
  const interaction = useInteraction(componentID, componentProps);
  /**
   * Resolve the child styles
   */
  if (children) {
    children = flattenChildren(children).map((child, nthChild, children) => {
      if (isValidElement(child)) {
        const childPropClassName = child.props.tw ?? child.props.className;
        const childClassName = childPropClassName;

        return isStyledComponent(child) ? (
          cloneElement(child, {
            nthChild: nthChild + 1,
            lastChild: children.length - 1 === nthChild,
            className: childClassName,
          } as Record<string, unknown>)
        ) : (
          <StyledComponent
            key={child.key}
            component={child.type}
            nthChild={nthChild + 1}
            lastChild={children.length - 1 === nthChild}
            {...child.props}
            className={childClassName}
          />
        );
      } else {
        return child;
      }
    });
  }

  const style = useMemo(() => {
    const hasStyles = styledProps && Object.keys(styledProps).length > 0;
    if (hasStyles && inlineStyles) {
      return [styledProps, inlineStyles];
    } else if (hasStyles) {
      return styledProps;
    } else if (inlineStyles) {
      return inlineStyles;
    }
  }, [styledProps, inlineStyles]);

  /**
   * Pass the styles to the element
   */
  const props = {
    ...componentProps,
    ...interaction,
    ...styledProps,
    style: [
      styledProps?.styles,
      style,
      component.interactionStyles.hover.active && component.interactionStyles.hover.styles,
      component.interactionStyles.active.active && component.interactionStyles.active.styles,
      component.interactionStyles.focus.active && component.interactionStyles.focus.styles,
    ],
    ref,
  };

  /**
   * Determine if we need to wrap element in Providers
   */
  //   if (typeof interactionMeta.group === 'string') {
  //     reactNode = (
  //       <groupContent.Provider
  //         value={{
  //           ...stateInheritance,
  //           [interactionMeta.group]: componentState,
  //         }}
  //       >
  //         {reactNode}
  //       </groupContent.Provider>
  //     );
  //   }

  return <Component {...props}>{children}</Component>;
}

function isStyledComponent(node: unknown) {
  return (node as any).displayName?.startsWith('StyledTW');
}

function flattenChildren(
  children: ReactNode | ReactNode[],
  keys: Array<string | number> = [],
): ReactNode[] {
  return Children.toArray(children).flatMap((node, index) => {
    if (isFragment(node)) {
      return flattenChildren(node.props.children, [...keys, node.key || index]);
    } else if (typeof node === 'string' || typeof node === 'number') {
      return [node];
    } else if (isValidElement(node)) {
      return [
        cloneElement(node, {
          key: `${keys.join('.')}.${node.key?.toString()}`,
        }),
      ];
    } else {
      return [];
    }
  });
}
