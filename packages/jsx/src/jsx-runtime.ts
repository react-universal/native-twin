import { hasOwnProperty } from '@native-twin/helpers';
import * as ReactJSXRuntime from 'react/jsx-runtime';
import { createTwinProps, mappedComponentsConfig, TwinElement } from './styled/native/createTwinCmp';
import type { NativeTwinProps } from './utils/constants';
// export type { EmotionJSX as JSX } from './jsx-namespace';
// import jsxWrapper from './jsx-wrapper';

/**
 * This the entry point for the @native-twin/jsx runtime.
 * The babel plugin swaps the `jsxImportSource` to this module.
 * These functions need to be very light weight as they are the hottest function calls in a React application
 * @see https://babeljs.io/docs/babel-plugin-transform-react-jsx
 * @see https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md#summary
 */
// export const Fragment = ReactJSXRuntime.Fragment;
// export const jsxs = jsxWrapper((ReactJSXRuntime as any).jsxs);
// export const jsx = jsxWrapper((ReactJSXRuntime as any).jsx);
// export const jsxDEV = jsxWrapper((ReactJSXRuntime as any).jsxDEV);
// export const createTwinElement = jsxWrapper(originalCreateElement as any);
// export const createElement = originalCreateElement;

export const Fragment = ReactJSXRuntime.Fragment;

export const jsx: typeof ReactJSXRuntime.jsx = (type, props, key) => {
  if (!hasOwnProperty.call(props, '__twinID')) {
    return ReactJSXRuntime.jsx(type, props, key);
  }

  return ReactJSXRuntime.jsx(
    TwinElement,
    createTwinProps(
      type,
      props as NativeTwinProps,
      mappedComponentsConfig.get(type) ?? { className: 'style' },
    ),
    key,
  );
};

export const jsxs: typeof ReactJSXRuntime.jsxs = (type, props, key) => {
  if (!hasOwnProperty.call(props, '__twinID')) {
    return ReactJSXRuntime.jsxs(type, props, key);
  }

  return ReactJSXRuntime.jsxs(
    TwinElement,
    createTwinProps(
      type,
      props as NativeTwinProps,
      mappedComponentsConfig.get(type) ?? { className: 'style' },
    ),
    key,
  );
};
