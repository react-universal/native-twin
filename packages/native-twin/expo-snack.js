import { createElement } from 'react';

const jsx = require('@native-twin/jsx/jsx-runtime');
const originalJSX = require('react/jsx-runtime');

Object.assign(originalJSX, jsx);

export function withExpoSnack(Component) {
  return function WithExpoSnackLoader() {
    return createElement(Component);
  };
}
