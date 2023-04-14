import { Children, cloneElement, isValidElement, useMemo, useRef } from 'react';
import { StyleProp, StyleSheet } from 'react-native';
import type { StyledObject } from '@universal-labs/stylesheets';

function useChildren(
  children: React.ReactNode,
  componentID: string,
  childStyles: [string, StyledObject][],
  getChildStyles: (meta: {
    isFirstChild: boolean;
    isLastChild: boolean;
    nthChild: number;
  }) => StyledObject[],
  groupID?: string,
) {
  const getChildStylesRef = useRef(getChildStyles);
  return useMemo(() => {
    // if (childStyles.length === 0) {
    //   return children;
    // }
    const totalChilds = Children.count(children);
    // if (totalChilds === 1 || childStyles.length === 0) {
    //   if (!isValidElement<{ style?: StyleProp<unknown> }>(children)) {
    //     return children;
    //   }
    //   return (
    //     <children.type
    //       {...{
    //         nthChild: 1,
    //         isFirstChild: true,
    //         isLastChild: true,
    //         parentID: componentID,
    //         groupID: groupID,
    //         ...children.props,
    //       }}
    //     />
    //   );
    // }
    return Children.map(children, (child, index) => {
      if (!isValidElement<{ style?: StyleProp<unknown> }>(child)) {
        return child;
      }
      const childProps = {
        nthChild: index + 1,
        isFirstChild: index === 0,
        isLastChild: index + 1 === totalChilds,
        parentID: componentID,
        groupID: groupID,
        ...child.props,
      };

      return isStyledComponent(child)
        ? cloneElement(child, {
            ...childProps,
          })
        : cloneElement(child, {
            ...childProps,
            style: StyleSheet.flatten([
              ...getChildStylesRef.current(childProps),
              childProps?.style,
            ]),
          });
    });
  }, [children, componentID, groupID]);
}

export { useChildren };

function isStyledComponent(node: unknown) {
  return (node as any).displayName?.startsWith('StyledTW');
}
