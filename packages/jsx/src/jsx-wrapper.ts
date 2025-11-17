// import { jsxStyles } from './jsx/jsx-styles';
// import { stylizeJSXChilds } from './jsx/jsx-childs';
import { hasOwnProperty } from '@native-twin/helpers';
import {
  createTwinProps,
  mappedComponentsConfig,
  TwinElement,
} from './styled';
// import { stylizedComponents } from './styled';
import type { JSXFunction } from './types/jsx.types';

/**
 * Create a new JSX function that swaps the component type being rendered with
 * the 'styled' version of the component if it exists.
 */
export default function jsxWrapper(jsx: JSXFunction): JSXFunction {
  return (type, props, ...rest) => {
    if (!hasOwnProperty.call(props, '__twinID')) {
      return jsx(type, props, ...rest);
    }
    if ((type as any) === 'react-native-twin-jsx-pragma-check') {
      // This is invalid react code. Its used by the doctor to check if the JSX pragma is set correctly
      return true as any;
    }

    // Load the core React Native components and create the interop versions
    // We avoid this in the test environment as we want more fine-grained control
    // This call also need to be inside the JSX transform to avoid circular dependencies
    // if (process.env['NODE_ENV'] !== 'test') require('./components');

    // Swap the component type with styled if it exists
    // if (props && props.twEnabled === false) {
    //   delete props.twEnabled;
    // } else if (stylizedComponents.has(type)) {
    //   type = stylizedComponents.get(type)!;
    // } else {
    //   // if (props?.['__twinID']) {
    //   //   type = createStylableComponent(type, {});
    //   // }
    // }
    // if (rest[1] && props?.['__twinID']) {
    //   console.log('IS:STATIC: ', {
    //     type,
    //     props,
    //   });
    // }

    // Call the original jsx function with the new type
    return jsx.call(
      jsx,
      TwinElement as any,
      createTwinProps(
        type,
        props as any,
        mappedComponentsConfig.get(type) ?? { className: 'style' },
      ) as any,
      ...rest,
    );
  };
}
// CHECKING rx4xp5
