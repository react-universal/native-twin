import { Children, cloneElement, isValidElement, useMemo } from 'react';
import type { StyleProp } from 'react-native';
import type ComponentNode from '../store/ComponentNode';

function useChildren(children: React.ReactNode, component: ComponentNode) {
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
        parentID: component.id,
        ...child.props,
      };

      return isStyledComponent(child)
        ? cloneElement(child, { ...childProps })
        : cloneElement(child, { ...childProps });
    });
  }, [children, component.id]);
}

export { useChildren };

function isStyledComponent(node: unknown) {
  return (node as any).displayName?.startsWith('StyledTW');
}

// function flattenChildren(
//   children: ReactNode | ReactNode[],
//   keys: Array<string | number> = [],
// ): ReactNode[] {
//   return Children.toArray(children).flatMap((node, index) => {
//     if (isFragment(node)) {
//       return flattenChildren(node.props.children, [...keys, node.key || index]);
//     } else if (typeof node === 'string' || typeof node === 'number') {
//       return [node];
//     } else if (isValidElement(node)) {
//       return [
//         cloneElement(node, {
//           key: `${keys.join('.')}.${node.key?.toString()}`,
//         }),
//       ];
//     } else {
//       return [];
//     }
//   });
// }
