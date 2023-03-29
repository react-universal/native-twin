import { Children, cloneElement, isValidElement, useMemo } from 'react';
import type { StyleProp } from 'react-native';
import type { IInteractionPayload } from '@universal-labs/stylesheets';

function useChildren(
  children: React.ReactNode,
  componentID: string,
  getChildStyles?: (props: any) => IInteractionPayload | undefined,
) {
  return useMemo(() => {
    const totalChilds = Children.count(children);
    return Children.map(children, (child, index) => {
      if (!isValidElement<{ style?: StyleProp<unknown> }>(child)) {
        return child;
      }
      const childProps = {
        nthChild: index + 1,
        isFirstChild: index === 0,
        isLastChild: index + 1 === totalChilds,
        parentID: componentID,
        ...child.props,
      };

      return isStyledComponent(child)
        ? cloneElement(child, {
            ...childProps,
            style: [childProps?.style, getChildStyles?.(childProps)],
          })
        : cloneElement(child, {
            ...childProps,
            // style: [childProps?.style, component.getChildStyles(childProps)],
          });
    });
  }, [children, componentID, getChildStyles]);
}

export { useChildren };

function isStyledComponent(node: unknown) {
  return (node as any).displayName?.startsWith('StyledTW');
}
