import { Children, cloneElement, isValidElement } from 'react';
import { isFragment } from 'react-is';
import { JSXInternalProps } from '../types/jsx.types';

export function stylizeJSXChilds(props: JSXInternalProps | null | undefined) {
  if (props && props['children'] && props['className']) {
    const originalChild = props['children'];

    const children = isFragment(originalChild)
      ? originalChild.props.children
      : originalChild;

    const totalChilds = Children.count(children);

    if (totalChilds === 1) {
      if (!isValidElement<any>(children)) {
        props['children'] = children;
      } else {
        // const child = props['children'];
        // if (!child['ord']) {
        // }
        props['children'] = cloneElement(children, {
          ord: 0,
          lastOrd: 0,
        } as Record<string, unknown>);
      }
    } else {
      // if (
      //   Children.toArray(children)
      //     .filter(Boolean)
      //     .every((x) => {
      //       if (!isValidElement<any>(x)) {
      //         return true;
      //       }
      //       return x['props']['ord'];
      //     })
      // ) {
      //   return;
      // }
      props['children'] = Children.toArray(children)
        .filter(Boolean)
        .flatMap((child, index) => {
          if (!isValidElement<any>(child)) {
            return child;
          }

          return cloneElement(child, {
            ord: index,
            lastOrd: totalChilds - 1,
          } as Record<string, unknown>);
        });
    }
  }
}
