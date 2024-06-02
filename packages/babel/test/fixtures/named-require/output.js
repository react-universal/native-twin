import { createTwinElement as _createTwinElement } from '@native-twin/jsx';

const { createElement } = require('react');
export default function App() {
  return _createTwinElement('div', {}, 'Hello World');
}