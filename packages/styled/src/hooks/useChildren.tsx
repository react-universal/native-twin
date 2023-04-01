import { Children, cloneElement, isValidElement, useMemo } from 'react';
import { StyleProp, StyleSheet } from 'react-native';
import type { IStyleType } from '@universal-labs/stylesheets';

function useChildren(
  children: React.ReactNode,
  componentID: string,
  getChildStyles: (meta: {
    isFirstChild: boolean;
    isLastChild: boolean;
    nthChild: number;
  }) => IStyleType[],
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
      const childStyles = getChildStyles?.(childProps);

      return isStyledComponent(child)
        ? cloneElement(child, {
            ...childProps,
            // style: [childProps?.style, ...childStyles],
          })
        : cloneElement(child, {
            ...childProps,
            style: StyleSheet.flatten([childProps?.style, ...childStyles]),
          });
    });
  }, [children, componentID, getChildStyles]);
}

export { useChildren };

function isStyledComponent(node: unknown) {
  return (node as any).displayName?.startsWith('StyledTW');
}
