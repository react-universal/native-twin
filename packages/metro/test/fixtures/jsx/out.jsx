(function (global) {
  var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.HomeScreen = HomeScreen;
  var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
  var _react = require("react");
  var _reactNative = require("react-native");
  var _styled = require("@native-twin/styled");
  var _jsxRuntime = require("react/jsx-runtime");
  var _this = this,
    _jsxFileName = "/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/out.tsx"; // @ts-noCheck
  var testImage = require('../../assets/favicon.png');
  var ChildProp = function ChildProp() {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      className: "bg-black last:text-lg",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        className: "text-blue",
        children: "Text1"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        className: "text-red",
        children: "Text2"
      })]
    });
  };
  var buttonVariants = (0, _styled.createVariants)({
    base: 'py-5 m-1 rounded-md items-center justify-center',
    variants: {
      variant: {
        primary: 'bg-blue-200',
        secondary: 'bg-white'
      },
      size: {
        large: 'w-40',
        small: 'w-4'
      },
      isDisable: {
        true: 'opacity-30',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'primary'
    }
  });
  var Button = function Button(props) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
      className: buttonVariants(props),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        children: "asd"
      })
    });
  };
  function HomeScreen() {
    var _useState = (0, _react.useState)(true),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      active = _useState2[0],
      setActive = _useState2[1];
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      className: "flex-1 -translate-x-2 w-[10vw]",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        className: `
          flex-1
          bg-red-500
          first:bg-purple-600
        `,
        debug: true,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          className: "p-2 !bg-green-800",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            className: `
              text(center xl primary)
              hover:text-gray-700
              `,
            children: "Hello World"
          })
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        className: `
          group
          flex-[2]
          !bg-green-800
          bg-gray-500
          hover:bg-pink-600
        `,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          className: `
            text-2xl
            ${active ? 'text-red-800' : 'text-primary'}
          `,
          children: "Nested Hover22222"
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
          onPressIn: function onPressIn() {
            setActive(function (prevState) {
              return !prevState;
            });
          },
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            className: "text-gray-200",
            children: "Activate"
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          className: `
            -top-1
            group-hover:bg-pink-800
          `,
          debug: true,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            suppressHighlighting: true,
            className: "text-gray-800 group-hover:text-white",
            children: "Deeply nested hover"
          })
        })]
      })]
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);