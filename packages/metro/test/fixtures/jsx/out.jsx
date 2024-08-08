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
    _jsxFileName = "/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/out.tsx";
  var globalStyles = require('.cache/native-twin/twin.styles');
  // @ts-noCheck

  var testImage = require('../../assets/favicon.png');
  var ChildProp = function ChildProp() {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      className: "bg-black last:text-lg",
      _twinOrd: 0,
      _twinComponentID: "a-694217970",
      _twinComponentTemplateEntries: [],
      _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("a-694217970", [{
        templateLiteral: null,
        prop: "className",
        target: "style",
        entries: [globalStyles.get("bg-black"), globalStyles.get("last:text-lg")].filter(Boolean),
        rawSheet: {
          base: [{
            className: "bg-black",
            declarations: [{
              prop: "backgroundColor",
              value: "rgba(0,0,0,1)",
              _tag: "COMPILED"
            }],
            selectors: [],
            precedence: 805306368,
            important: false,
            animations: []
          }],
          dark: [],
          pointer: [],
          group: [],
          even: [],
          first: [],
          last: [],
          odd: []
        }
      }]),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        className: "text-blue",
        _twinOrd: 0,
        _twinComponentID: "a:a-1259381967",
        _twinComponentTemplateEntries: [],
        _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("a:a-1259381967", [{
          templateLiteral: null,
          prop: "className",
          target: "style",
          entries: [globalStyles.get("text-blue")].filter(Boolean),
          rawSheet: {
            base: [{
              className: "text-blue",
              declarations: [{
                prop: "color",
                value: "rgba(96,165,250,1)",
                _tag: "COMPILED"
              }],
              selectors: [],
              precedence: 805306368,
              important: false,
              animations: []
            }, {
              className: "first:bg-purple-600",
              declarations: [{
                prop: "backgroundColor",
                value: "rgba(147,51,234,1)",
                _tag: "COMPILED"
              }],
              selectors: ["first", "&:first"],
              precedence: 805437440,
              important: false,
              animations: []
            }, {
              className: "first:bg-purple-600",
              declarations: [{
                prop: "backgroundColor",
                value: "rgba(147,51,234,1)",
                _tag: "COMPILED"
              }],
              selectors: ["first", "&:first"],
              precedence: 805437440,
              important: false,
              animations: []
            }],
            dark: [],
            pointer: [],
            group: [],
            even: [],
            first: [],
            last: [],
            odd: []
          }
        }]),
        children: "Text1"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        className: "text-red",
        _twinOrd: 1,
        _twinComponentID: "a:b-1257239257",
        _twinComponentTemplateEntries: [],
        _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("a:b-1257239257", [{
          templateLiteral: null,
          prop: "className",
          target: "style",
          entries: [globalStyles.get("text-red")].filter(Boolean),
          rawSheet: {
            base: [{
              className: "text-red",
              declarations: [{
                prop: "color",
                value: "rgba(248,113,113,1)",
                _tag: "COMPILED"
              }],
              selectors: [],
              precedence: 805306368,
              important: false,
              animations: []
            }],
            dark: [],
            pointer: [],
            group: [],
            even: [],
            first: [],
            last: [],
            odd: []
          }
        }]),
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
      _twinOrd: 0,
      _twinComponentID: "b-694218583",
      _twinComponentTemplateEntries: [{
        id: "b-694218583",
        target: "style",
        prop: "className",
        entries: require('@native-twin/core').tw(`${buttonVariants(props)}`),
        templateLiteral: `${buttonVariants(props)}`
      }],
      _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("b-694218583", [{
        templateLiteral: null,
        prop: "className",
        target: "style",
        entries: [].filter(Boolean),
        rawSheet: {
          base: [],
          dark: [],
          pointer: [],
          group: [],
          even: [],
          first: [],
          last: [],
          odd: []
        }
      }]),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        _twinOrd: 0,
        _twinComponentID: "b:a-1259381866",
        _twinComponentTemplateEntries: [],
        _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("b:a-1259381866"),
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
      _twinOrd: 0,
      _twinComponentID: "c-694217884",
      _twinComponentTemplateEntries: [],
      _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("c-694217884", [{
        templateLiteral: null,
        prop: "className",
        target: "style",
        entries: [globalStyles.get("flex-1"), globalStyles.get("-translate-x-2"), globalStyles.get("w-[10vw]")].filter(Boolean),
        rawSheet: {
          base: [{
            className: "flex-1",
            declarations: [{
              prop: "flex",
              value: {
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: "0%"
              },
              _tag: "COMPILED"
            }],
            selectors: [],
            precedence: 805306368,
            important: false,
            animations: []
          }, {
            className: "-translate-x-2",
            declarations: [{
              prop: "transform",
              value: [{
                prop: "translateX",
                value: -8,
                _tag: "COMPILED"
              }],
              _tag: "COMPILED"
            }],
            selectors: [],
            precedence: 805306368,
            important: false,
            animations: []
          }, {
            className: "w-[10vw]",
            declarations: [{
              prop: "width",
              value: "10vw",
              _tag: "NOT_COMPILED"
            }],
            selectors: [],
            precedence: 805306368,
            important: false,
            animations: []
          }],
          dark: [],
          pointer: [],
          group: [],
          even: [],
          first: [],
          last: [],
          odd: []
        }
      }]),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        className: `
          flex-1
          bg-red-500
          first:bg-purple-600
        `,
        debug: true,
        _twinOrd: 0,
        _twinComponentID: "c:a-1259381797",
        _twinComponentTemplateEntries: [],
        _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("c:a-1259381797", [{
          templateLiteral: null,
          prop: "className",
          target: "style",
          entries: [globalStyles.get("flex-1"), globalStyles.get("bg-red-500"), globalStyles.get("first:bg-purple-600")].filter(Boolean),
          rawSheet: {
            base: [{
              className: "flex-1",
              declarations: [{
                prop: "flex",
                value: {
                  flexGrow: 1,
                  flexShrink: 1,
                  flexBasis: "0%"
                },
                _tag: "COMPILED"
              }],
              selectors: [],
              precedence: 805306368,
              important: false,
              animations: []
            }, {
              className: "bg-red-500",
              declarations: [{
                prop: "backgroundColor",
                value: "rgba(239,68,68,1)",
                _tag: "COMPILED"
              }],
              selectors: [],
              precedence: 805306368,
              important: false,
              animations: []
            }, {
              className: "first:bg-purple-600",
              declarations: [{
                prop: "backgroundColor",
                value: "rgba(147,51,234,1)",
                _tag: "COMPILED"
              }],
              selectors: ["first", "&:first"],
              precedence: 805437440,
              important: false,
              animations: []
            }, {
              className: "first:bg-purple-600",
              declarations: [{
                prop: "backgroundColor",
                value: "rgba(147,51,234,1)",
                _tag: "COMPILED"
              }],
              selectors: ["first", "&:first"],
              precedence: 805437440,
              important: false,
              animations: []
            }],
            dark: [],
            pointer: [],
            group: [],
            even: [],
            first: [],
            last: [],
            odd: []
          }
        }]),
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          className: "p-2 !bg-green-800",
          _twinOrd: 0,
          _twinComponentID: "c:a:a-191903644",
          _twinComponentTemplateEntries: [],
          _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("c:a:a-191903644", [{
            templateLiteral: null,
            prop: "className",
            target: "style",
            entries: [globalStyles.get("p-2"), globalStyles.get("!bg-green-800")].filter(Boolean),
            rawSheet: {
              base: [{
                className: "p-2",
                declarations: [{
                  prop: "padding",
                  value: 8,
                  _tag: "COMPILED"
                }],
                selectors: [],
                precedence: 805306368,
                important: false,
                animations: []
              }, {
                className: "!bg-green-800",
                declarations: [{
                  prop: "backgroundColor",
                  value: "rgba(22,101,52,1)",
                  _tag: "COMPILED"
                }],
                selectors: [],
                precedence: 805306368,
                important: true,
                animations: []
              }, {
                className: "first:bg-purple-600",
                declarations: [{
                  prop: "backgroundColor",
                  value: "rgba(147,51,234,1)",
                  _tag: "COMPILED"
                }],
                selectors: ["first", "&:first"],
                precedence: 805437440,
                important: false,
                animations: []
              }, {
                className: "first:bg-purple-600",
                declarations: [{
                  prop: "backgroundColor",
                  value: "rgba(147,51,234,1)",
                  _tag: "COMPILED"
                }],
                selectors: ["first", "&:first"],
                precedence: 805437440,
                important: false,
                animations: []
              }],
              dark: [],
              pointer: [],
              group: [],
              even: [],
              first: [],
              last: [],
              odd: []
            }
          }]),
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            className: `
              text(center xl primary)
              hover:text-gray-700
              `,
            _twinOrd: 0,
            _twinComponentID: "c:a:a:a-1636126501",
            _twinComponentTemplateEntries: [],
            _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("c:a:a:a-1636126501", [{
              templateLiteral: null,
              prop: "className",
              target: "style",
              entries: [globalStyles.get("text-center"), globalStyles.get("text-xl"), globalStyles.get("text-primary"), globalStyles.get("hover:text-gray-700")].filter(Boolean),
              rawSheet: {
                base: [{
                  className: "text-center",
                  declarations: [{
                    prop: "textAlign",
                    value: "center",
                    _tag: "COMPILED"
                  }],
                  selectors: [],
                  precedence: 805306368,
                  important: false,
                  animations: []
                }, {
                  className: "text-xl",
                  declarations: [{
                    prop: "fontSize",
                    value: 20,
                    _tag: "COMPILED"
                  }],
                  selectors: [],
                  precedence: 805306368,
                  important: false,
                  animations: []
                }, {
                  className: "text-primary",
                  declarations: [{
                    prop: "color",
                    value: "blue",
                    _tag: "COMPILED"
                  }],
                  selectors: [],
                  precedence: 805306368,
                  important: false,
                  animations: []
                }, {
                  className: "first:bg-purple-600",
                  declarations: [{
                    prop: "backgroundColor",
                    value: "rgba(147,51,234,1)",
                    _tag: "COMPILED"
                  }],
                  selectors: ["first", "&:first"],
                  precedence: 805437440,
                  important: false,
                  animations: []
                }, {
                  className: "first:bg-purple-600",
                  declarations: [{
                    prop: "backgroundColor",
                    value: "rgba(147,51,234,1)",
                    _tag: "COMPILED"
                  }],
                  selectors: ["first", "&:first"],
                  precedence: 805437440,
                  important: false,
                  animations: []
                }],
                dark: [],
                pointer: [{
                  className: "hover:text-gray-700",
                  declarations: [{
                    prop: "color",
                    value: "rgba(55,65,81,1)",
                    _tag: "COMPILED"
                  }],
                  selectors: ["hover", "&:hover"],
                  precedence: 805307392,
                  important: false,
                  animations: []
                }],
                group: [],
                even: [],
                first: [],
                last: [],
                odd: []
              }
            }]),
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
        _twinOrd: 1,
        _twinComponentID: "c:b-1257213251",
        _twinComponentTemplateEntries: [],
        _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("c:b-1257213251", [{
          templateLiteral: null,
          prop: "className",
          target: "style",
          entries: [globalStyles.get("group"), globalStyles.get("flex-[2]"), globalStyles.get("bg-gray-500"), globalStyles.get("!bg-green-800"), globalStyles.get("hover:bg-pink-600")].filter(Boolean),
          rawSheet: {
            base: [{
              className: "flex-[2]",
              declarations: [{
                prop: "flex",
                value: {
                  flexGrow: 2,
                  flexShrink: 2,
                  flexBasis: "0%"
                },
                _tag: "COMPILED"
              }],
              selectors: [],
              precedence: 805306368,
              important: false,
              animations: []
            }, {
              className: "bg-gray-500",
              declarations: [{
                prop: "backgroundColor",
                value: "rgba(107,114,128,1)",
                _tag: "COMPILED"
              }],
              selectors: [],
              precedence: 805306368,
              important: false,
              animations: []
            }, {
              className: "!bg-green-800",
              declarations: [{
                prop: "backgroundColor",
                value: "rgba(22,101,52,1)",
                _tag: "COMPILED"
              }],
              selectors: [],
              precedence: 805306368,
              important: true,
              animations: []
            }],
            dark: [],
            pointer: [{
              className: "hover:bg-pink-600",
              declarations: [{
                prop: "backgroundColor",
                value: "rgba(219,39,119,1)",
                _tag: "COMPILED"
              }],
              selectors: ["hover", "&:hover"],
              precedence: 805307392,
              important: false,
              animations: []
            }],
            group: [],
            even: [],
            first: [],
            last: [],
            odd: []
          }
        }]),
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          className: `
            text-2xl
            ${active ? 'text-red-800' : 'text-primary'}
          `,
          _twinOrd: 0,
          _twinComponentID: "c:b:a-192015277",
          _twinComponentTemplateEntries: [{
            id: "c:b:a-192015277",
            target: "style",
            prop: "className",
            entries: require('@native-twin/core').tw(`${active ? 'text-red-800' : 'text-primary'}`),
            templateLiteral: `${active ? 'text-red-800' : 'text-primary'}`
          }],
          _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("c:b:a-192015277", [{
            templateLiteral: null,
            prop: "className",
            target: "style",
            entries: [globalStyles.get("text-2xl")].filter(Boolean),
            rawSheet: {
              base: [{
                className: "text-2xl",
                declarations: [{
                  prop: "fontSize",
                  value: 24,
                  _tag: "COMPILED"
                }],
                selectors: [],
                precedence: 805306368,
                important: false,
                animations: []
              }, {
                className: "first:bg-purple-600",
                declarations: [{
                  prop: "backgroundColor",
                  value: "rgba(147,51,234,1)",
                  _tag: "COMPILED"
                }],
                selectors: ["first", "&:first"],
                precedence: 805437440,
                important: false,
                animations: []
              }, {
                className: "first:bg-purple-600",
                declarations: [{
                  prop: "backgroundColor",
                  value: "rgba(147,51,234,1)",
                  _tag: "COMPILED"
                }],
                selectors: ["first", "&:first"],
                precedence: 805437440,
                important: false,
                animations: []
              }],
              dark: [],
              pointer: [],
              group: [],
              even: [],
              first: [],
              last: [],
              odd: []
            }
          }]),
          children: "Nested Hover22222"
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Pressable, {
          onPressIn: function onPressIn() {
            setActive(function (prevState) {
              return !prevState;
            });
          },
          _twinOrd: 1,
          _twinComponentID: "c:b:b-264901931",
          _twinComponentTemplateEntries: [],
          _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("c:b:b-264901931"),
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            className: "text-gray-200",
            _twinOrd: 0,
            _twinComponentID: "c:b:b:a-1829462821",
            _twinComponentTemplateEntries: [],
            _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("c:b:b:a-1829462821", [{
              templateLiteral: null,
              prop: "className",
              target: "style",
              entries: [globalStyles.get("text-gray-200")].filter(Boolean),
              rawSheet: {
                base: [{
                  className: "text-gray-200",
                  declarations: [{
                    prop: "color",
                    value: "rgba(229,231,235,1)",
                    _tag: "COMPILED"
                  }],
                  selectors: [],
                  precedence: 805306368,
                  important: false,
                  animations: []
                }, {
                  className: "first:bg-purple-600",
                  declarations: [{
                    prop: "backgroundColor",
                    value: "rgba(147,51,234,1)",
                    _tag: "COMPILED"
                  }],
                  selectors: ["first", "&:first"],
                  precedence: 805437440,
                  important: false,
                  animations: []
                }, {
                  className: "first:bg-purple-600",
                  declarations: [{
                    prop: "backgroundColor",
                    value: "rgba(147,51,234,1)",
                    _tag: "COMPILED"
                  }],
                  selectors: ["first", "&:first"],
                  precedence: 805437440,
                  important: false,
                  animations: []
                }],
                dark: [],
                pointer: [],
                group: [],
                even: [],
                first: [],
                last: [],
                odd: []
              }
            }]),
            children: "Activate"
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          className: `
            -top-1
            group-hover:bg-pink-800
          `,
          debug: true,
          _twinOrd: 2,
          _twinComponentID: "c:b:c-4504757",
          _twinComponentTemplateEntries: [],
          _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("c:b:c-4504757", [{
            templateLiteral: null,
            prop: "className",
            target: "style",
            entries: [globalStyles.get("-top-1"), globalStyles.get("group-hover:bg-pink-800")].filter(Boolean),
            rawSheet: {
              base: [{
                className: "-top-1",
                declarations: [{
                  prop: "top",
                  value: -4,
                  _tag: "COMPILED"
                }],
                selectors: [],
                precedence: 805306368,
                important: false,
                animations: []
              }],
              dark: [],
              pointer: [],
              group: [{
                className: "group-hover:bg-pink-800",
                declarations: [{
                  prop: "backgroundColor",
                  value: "rgba(157,23,77,1)",
                  _tag: "COMPILED"
                }],
                selectors: ["group-hover", ".group:hover &"],
                precedence: 805307392,
                important: false,
                animations: []
              }],
              even: [],
              first: [],
              last: [],
              odd: []
            }
          }]),
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            suppressHighlighting: true,
            className: "text-gray-800 group-hover:text-white",
            _twinOrd: 0,
            _twinComponentID: "c:b:c:a-1756547946",
            _twinComponentTemplateEntries: [],
            _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("c:b:c:a-1756547946", [{
              templateLiteral: null,
              prop: "className",
              target: "style",
              entries: [globalStyles.get("text-gray-800"), globalStyles.get("group-hover:text-white")].filter(Boolean),
              rawSheet: {
                base: [{
                  className: "text-gray-800",
                  declarations: [{
                    prop: "color",
                    value: "rgba(31,41,55,1)",
                    _tag: "COMPILED"
                  }],
                  selectors: [],
                  precedence: 805306368,
                  important: false,
                  animations: []
                }, {
                  className: "first:bg-purple-600",
                  declarations: [{
                    prop: "backgroundColor",
                    value: "rgba(147,51,234,1)",
                    _tag: "COMPILED"
                  }],
                  selectors: ["first", "&:first"],
                  precedence: 805437440,
                  important: false,
                  animations: []
                }, {
                  className: "first:bg-purple-600",
                  declarations: [{
                    prop: "backgroundColor",
                    value: "rgba(147,51,234,1)",
                    _tag: "COMPILED"
                  }],
                  selectors: ["first", "&:first"],
                  precedence: 805437440,
                  important: false,
                  animations: []
                }],
                dark: [],
                pointer: [],
                group: [{
                  className: "group-hover:text-white",
                  declarations: [{
                    prop: "color",
                    value: "rgba(255,255,255,1)",
                    _tag: "COMPILED"
                  }],
                  selectors: ["group-hover", ".group:hover &"],
                  precedence: 805307392,
                  important: false,
                  animations: []
                }],
                even: [],
                first: [],
                last: [],
                odd: []
              }
            }]),
            children: "Deeply nested hover"
          })
        })]
      })]
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);