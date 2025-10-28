import { hasOwnProperty } from '@native-twin/helpers';
import * as ReactJSXRuntimeDev from 'react/jsx-dev-runtime';
import {
  createTwinProps,
  mappedComponentsConfig,
  stylizedComponents,
  TwinElement,
} from './styled/native/createTwinCmp';
import { getComponentDisplayName } from './utils/react.utils';

/**
 * This the entry point for the @native-twin/jsx runtime.
 * The babel plugin swaps the `jsxImportSource` to this module.
 * These functions need to be very light weight as they are the hottest function calls in a React application
 * @see https://babeljs.io/docs/babel-plugin-transform-react-jsx
 * @see https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md#summary
 */
export const Fragment = ReactJSXRuntimeDev.Fragment;

export const jsxDEV: typeof ReactJSXRuntimeDev.jsxDEV = (
  type,
  props,
  isStaticChildren,
  source,
  self,
) => {
  // console.log('WRAP: ', mappedComponentsConfig.has(type));
  const hasTwinID = hasOwnProperty.call(props, '__twinID');
  // console.log('HAS_ID: ', {
  //   isMapped: mappedComponentsConfig.has(type),
  //   id: hasTwinID,
  //   type,
  // });

  if (!hasTwinID) {
    return ReactJSXRuntimeDev.jsxDEV(type, props, isStaticChildren, source, self);
  }
  if ((type as any) === 'react-native-twin-jsx-pragma-check') {
    // This is invalid react code. Its used by the doctor to check if the JSX pragma is set correctly
    return true as any;
  }

  // Load the core React Native components and create the interop versions
  // We avoid this in the test environment as we want more fine-grained control
  // This call also need to be inside the JSX transform to avoid circular dependencies
  if (process.env['NODE_ENV'] !== 'test') require('./components');

  // Swap the component type with styled if it exists
  if (props && hasOwnProperty.call(props, 'twEnabled') === false && stylizedComponents.has(type)) {
    // Reflect.deleteProperty(props, 'twEnabled');
    // console.log('TW_ENABLED: ', type);
    // type = stylizedComponents.get(type)!;
  }
  // if (stylizedComponents.has(type)) {
  //   type = stylizedComponents.get(type)!;
  // }

  // Call the original jsx function with the new type
  if (typeof type === 'string') {
    Object.assign(type, { displayName: type });
  } else {
    const name = getComponentDisplayName(type);
    // console.log('NAME: ', name);
    type['displayName'] = name;
  }
  return ReactJSXRuntimeDev.jsxDEV(
    TwinElement as any,
    createTwinProps(
      type,
      props as any,
      mappedComponentsConfig.get(type) ?? { className: 'style' },
    ) as any,
    isStaticChildren,
    source,
    self,
  );
};
// export const createTwinElement = jsxWrapper(originalCreateElement as any);
// export const createElement = originalCreateElement;
