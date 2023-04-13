import { Children, cloneElement, isValidElement } from 'react';
import { StyleProp, StyleSheet } from 'react-native';
import { getChildStylesFromStore } from '@universal-labs/stylesheets';
import { isFragment } from 'react-is';

function useChildren(
  componentChildren: React.ReactNode,
  componentID: string,
  groupID?: string,
) {
  const children = isFragment(componentChildren)
    ? componentChildren.props.children
    : componentChildren;
  const totalChilds = Children.count(children);
  return Children.toArray(children)
    .filter(Boolean)
    .map((child, index) => {
      if (!isValidElement<{ style?: StyleProp<unknown> }>(child)) {
        return child;
      }

      const style = getChildStylesFromStore({
        componentID,
        nthChild: index + 1,
        isFirstChild: index === 0,
        isLastChild: index + 1 === totalChilds,
      });

      if (!style || style.length === 0) {
        return child;
      }

      return child.props.style
        ? cloneElement(child, {
            style: StyleSheet.flatten([child.props.style]),
            // @ts-expect-error
            childStyles: style,
            parentID: componentID,
            groupID: groupID,
          })
        : // @ts-expect-error
          cloneElement(child, { style, parentID: componentID, groupID: groupID });
    });
}

export { useChildren };
