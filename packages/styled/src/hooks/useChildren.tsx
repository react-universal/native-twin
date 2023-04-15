import { Children, cloneElement, isValidElement, useMemo } from 'react';
import { StyleProp, StyleSheet } from 'react-native';
import type { AnyStyle } from '@universal-labs/stylesheets';
import { isFragment } from 'react-is';

function useChildren(
  componentChildren: React.ReactNode,
  componentID: string,
  groupID: string,
  getChildStyles: (input: {
    isFirstChild: boolean;
    isLastChild: boolean;
    isEven: boolean;
    isOdd: boolean;
  }) => AnyStyle,
) {
  const children = isFragment(componentChildren)
    ? componentChildren.props.children
    : componentChildren;
  // if (totalChilds === 1) {
  //   return children;
  // }
  return useMemo(() => {
    const totalChilds = Children.count(children);
    return Children.toArray(children)
      .filter(Boolean)
      .map((child, index) => {
        if (!isValidElement<{ style?: StyleProp<unknown> }>(child)) {
          return child;
        }

        const style = getChildStyles({
          isEven: (index + 1) % 2 === 0,
          isOdd: (index + 1) % 2 !== 0,
          isFirstChild: index === 0,
          isLastChild: index + 1 === totalChilds,
        });

        if (!style || Object.keys(style).length === 0) {
          return cloneElement(child, {
            // @ts-expect-error
            parentID: componentID,
            groupID,
          });
        }
        if (child.props.style) {
          return cloneElement(child, {
            style: StyleSheet.flatten([child.props.style, style]),
            // @ts-expect-error
            parentID: componentID,
            groupID: groupID,
          });
        }
        return cloneElement(child, {
          style: StyleSheet.flatten(style),
          // @ts-expect-error
          parentID: componentID,
          groupID: groupID,
        });
      });
  }, [componentID, groupID, getChildStyles, children]);
}

export { useChildren };
