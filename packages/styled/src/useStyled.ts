import { useMemo } from 'react';
import { PanResponder } from 'react-native';
import { useTailwind, useComponentState } from '@react-universal/core';

export default function useStyled(className: string) {
  const {
    id,
    styles: classNameStyles,
    hasInteractions,
    interactionStyles,
  } = useTailwind(className);
  const { state: componentState, onBlur, onHover } = useComponentState();
  const styles = useMemo(() => {
    if (!hasInteractions) return [classNameStyles];
    if (componentState.hover) {
      return [
        classNameStyles,
        interactionStyles.find(([name]) => name === 'hover')?.[1].styles,
      ];
    }
    return [classNameStyles];
  }, [classNameStyles, hasInteractions, interactionStyles, componentState.hover]);

  const panResponder = useMemo(() => {
    if (!hasInteractions) {
      return PanResponder.create({});
    }
    return PanResponder.create({
      onStartShouldSetPanResponder(event, gestureState) {
        return hasInteractions && gestureState.numberActiveTouches === 1;
      },
      onPanResponderGrant(event, gestureState) {
        if (gestureState.numberActiveTouches === 1) {
          onHover();
        }
      },
      onPanResponderEnd() {
        onBlur();
      },
    });
  }, [hasInteractions, onBlur, onHover]);

  return {
    styles,
    id,
    panHandlers: panResponder.panHandlers,
    hasInteractions,
  };
}

// function isStyledComponent(node: unknown) {
//   return (node as any).displayName?.startsWith('StyledTW');
// }

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
