import {
  ReactNode,
  useMemo,
  Children,
  isValidElement,
  cloneElement,
  useId,
  forwardRef,
} from 'react';
import { isFragment } from 'react-is';
import { useInteraction, useComponentRegistration } from './hooks';
import type { StyledComponentType } from './styled.types';

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
  const { style } = useComponentRegistration(componentID, propClassName ?? tw);
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

  const finalStyles = useMemo(() => {
    const hasStyles = style && Object.keys(style).length > 0;
    if (hasStyles && inlineStyles) {
      return [style, inlineStyles];
    } else if (hasStyles) {
      return style;
    } else if (inlineStyles) {
      return inlineStyles;
    }
  }, [style, inlineStyles]);

  /**
   * Pass the styles to the element
   */
  const props = {
    ...componentProps,
    ...interaction,
    style: finalStyles,
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
