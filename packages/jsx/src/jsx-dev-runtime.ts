import * as ReactJSXRuntimeDev from 'react/jsx-dev-runtime';
import jsxWrapper from './jsx-wrapper';

/**
 * This the entry point for the @native-twin/jsx runtime.
 * The babel plugin swaps the `jsxImportSource` to this module.
 * These functions need to be very light weight as they are the hottest function calls in a React application
 * @see https://babeljs.io/docs/babel-plugin-transform-react-jsx
 * @see https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md#summary
 */
export const Fragment = ReactJSXRuntimeDev.Fragment;

export const jsxDEV = jsxWrapper((ReactJSXRuntimeDev as any).jsxDEV);
// export const createTwinElement = jsxWrapper(originalCreateElement as any);
// export const createElement = originalCreateElement;
