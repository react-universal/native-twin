import { Children, cloneElement, isValidElement, useMemo, useRef } from 'react';
import type { StyleProp } from 'react-native';
import type { IStyleType } from '@universal-labs/stylesheets';

function useChildren(
  children: React.ReactNode,
  componentID: string,
  getChildStyles: (meta: {
    isFirstChild: boolean;
    isLastChild: boolean;
    nthChild: number;
  }) => IStyleType[],
  groupID?: string,
) {
  const getChildStylesRef = useRef(getChildStyles);
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
        groupID: groupID,
        ...child.props,
      };

      return isStyledComponent(child)
        ? cloneElement(child, {
            ...childProps,
          })
        : cloneElement(child, {
            ...childProps,
            style: [childProps?.style, ...getChildStylesRef.current(childProps)],
          });
    });
  }, [children, componentID, groupID]);
}

export { useChildren };

function isStyledComponent(node: unknown) {
  return (node as any).displayName?.startsWith('StyledTW');
}
