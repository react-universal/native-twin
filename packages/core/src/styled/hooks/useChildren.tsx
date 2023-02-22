import { Children, cloneElement, isValidElement, ReactNode } from 'react';
import type { StyleProp } from 'react-native';
import { isFragment } from 'react-is';
import type { IComponentState } from '../../types/styles.types';

function useChildren(children: React.ReactNode, componentState: IComponentState) {
  return flattenChildren(children)
    .filter(Boolean)
    .flatMap((child, index) => {
      if (!isValidElement<{ style?: StyleProp<unknown> }>(child)) {
        return child;
      }

      const childProps = {
        nthChild: index + 1,
        parentHover: componentState.hover,
        parentFocus: componentState.focus,
        parentActive: componentState.active,
        ...child.props,
      };

      return isStyledComponent(child)
        ? cloneElement(child, Object.assign({ style: [child.props.style] }, childProps))
        : cloneElement(child);
    });
}

export { useChildren };

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
