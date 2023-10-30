var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');
Object.defineProperty(exports, '__esModule', { value: true });
exports.Main = void 0;
var _slicedToArray2 = _interopRequireDefault(require('@babel/runtime/helpers/slicedToArray'));
var _react = require('react');
var _nativeTwin = require('@universal-labs/native-twin');
var _presetTailwind = require('@universal-labs/preset-tailwind');
var _styled = require('@universal-labs/styled');
var _jsxRuntime = require('react/jsx-runtime');
(0, _nativeTwin.setup)(
  (0, _nativeTwin.defineConfig)({ presets: [(0, _presetTailwind.presetTailwind)()] }),
);
var Main = function Main() {
  var _useState = (0, _react.useState)({ backgroundColor: 'back' }),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    state = _useState2[0],
    dispatch = _useState2[1];
  return (0, _jsxRuntime.jsx)(_styled.View, { className: 'flex-1 bg-gray-200', style: state });
};
exports.Main = Main;