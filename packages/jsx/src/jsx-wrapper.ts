import { Children, cloneElement, isValidElement } from 'react';
import { isFragment } from 'react-is';
import { stylizedComponents } from './styled/createTwinCmp';
import type { JSXFunction } from './types/jsx.types';

/**
 * Create a new JSX function that swaps the component type being rendered with
 * the 'styled' version of the component if it exists.
 */
export default function jsxWrapper(jsx: JSXFunction): JSXFunction {
  return function (type, props, ...rest) {
    // This is invalid react code. Its used by the doctor to check if the JSX pragma is set correctly
    if ((type as any) === 'react-native-twin-jsx-pragma-check') {
      return true as any;
    }

    // Load the core React Native components and create the interop versions
    // We avoid this in the test environment as we want more fine-grained control
    // This call also need to be inside the JSX transform to avoid circular dependencies
    if (process.env['NODE_ENV'] !== 'test') require('./components');

    // You can disable the native twin jsx by setting `twEnabled` to false
    if (props && props.twEnabled === false) {
      delete props.twEnabled;
    } else {
      // Swap the component type with styled if it exists
      type = stylizedComponents.get(type) ?? type;
    }

    if (props && props['children'] && props['className']) {
      // console.group('JSX_ELEMENT: ', props['className']);
      // console.log('TYPE: ', type);
      // console.log('FULL_PROPS: ', props);
      // console.log('CHILDREN: ', props['children']);
      // console.groupEnd();
      const originalChild = props['children'];

      const children = isFragment(originalChild)
        ? originalChild.props.children
        : originalChild;

      const totalChilds = Children.count(children);

      if (totalChilds === 1) {
        if (!isValidElement<any>(children)) {
          props['children'] = children;
        } else {
          props['children'] = cloneElement(children, {
            ord: 0,
            lastOrd: 0,
          } as Record<string, unknown>);
        }
      } else {
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
    // if (props?.['className']) {
    //   console.log('JSX_CLASSNAMES: ', {
    //     classNames: props['className'],
    //     type,
    //   });
    // }

    // if (props?.['configs'] && props?.['children']) {
    //   let attach = false;
    //   const children = props?.['children'];
    //   const configs = props['configs'];
    //   props['children'] = asArray(children).map((x) => {
    //     if (!isValidElement<any>(x)) {
    //       return x;
    //     }
    //     for (const config of configs) {
    //       const source = x?.props?.[config.source];
    //       const sheet = x?.props?.sheet;
    //       if (!source || sheet) continue;

    //       if (source) {
    //         console.log('SOURCE: ', source);
    //         const sheet = new StyledComponentHandler(props['configs'], props);
    //         x.props['sheet'] = sheet;
    //       }
    //       return cloneElement(x, {
    //         sheet,
    //       });
    //     }
    //     return cloneElement(x);
    //   });
    //   if (attach) {
    //     const sheet = new StyledComponentHandler(props['configs'], props);
    //     console.log('SHEET: ', sheet);
    //     props['sheet'] = sheet;
    //   }
    // }

    // Call the original jsx function with the new type
    return jsx.call(jsx, type, props, ...rest);
  };
}
