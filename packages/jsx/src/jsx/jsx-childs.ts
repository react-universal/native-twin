import { Children, cloneElement, isValidElement } from 'react';
import { isFragment } from 'react-is';
import type { JSXInternalProps } from '../types/jsx.types';

export function stylizeJSXChilds(props: JSXInternalProps | null | undefined) {
  if (props && props['children']) {
    const originalChild = props['children'];

    const children = isFragment(originalChild)
      ? originalChild.props.children
      : originalChild;

    const totalChilds = Children.count(children);
    if (totalChilds === 1) {
      if (!isValidElement<any>(children)) {
        return;
      } else {
        const children = props['children'];

        props['children'] = cloneElement(children, {
          __parentProps: props._twinInjected,
          ord: 0,
          lastOrd: 0,
        } as Record<string, unknown>);
      }
    } else {
      if (
        Children.toArray(children)
          .filter(Boolean)
          .every((x) => !isValidElement<any>(x))
      ) {
        return;
      }

      props['children'] = Children.toArray(children)
        .filter(Boolean)
        .flatMap((child, index) => {
          if (!isValidElement<any>(child)) {
            return child;
          }

          return cloneElement(child, {
            __parentProps: props._twinInjected,
            ord: index,
            lastOrd: totalChilds - 1,
          } as Record<string, unknown>);
        });
    }
  }
}
