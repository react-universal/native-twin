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
      _twinOrd: 0,
      _twinComponentID: "/fixtures/out.tsx-345-490-View",
      _twinComponentTemplateEntries: [],
      _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-345-490-View", [{
        templateLiteral: null,
        prop: "className",
        target: "style",
        rawEntries: [{
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
        }, {
          className: "last:text-lg",
          declarations: [{
            prop: "fontSize",
            value: 18,
            _tag: "COMPILED"
          }],
          selectors: ["last", "&:last"],
          precedence: 805437440,
          important: false,
          animations: []
        }],
        entries: {
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
        },
        metadata: {
          hasAnimations: false,
          hasGroupEvents: true,
          hasPointerEvents: true,
          isGroupParent: true
        }
      }]),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        className: "text-blue",
        _twinOrd: 0,
        _twinComponentID: "/fixtures/out.tsx-392-432-Text",
        _twinComponentTemplateEntries: [],
        _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-392-432-Text", [{
          templateLiteral: null,
          prop: "className",
          target: "style",
          rawEntries: [{
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
          }],
          entries: {
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
            }],
            dark: [],
            pointer: [],
            group: [],
            even: [],
            first: [],
            last: [],
            odd: []
          },
          metadata: {
            hasAnimations: false,
            hasGroupEvents: true,
            hasPointerEvents: true,
            isGroupParent: true
          }
        }]),
        children: "Text1"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        className: "text-red",
        _twinOrd: 1,
        _twinComponentID: "/fixtures/out.tsx-439-478-Text",
        _twinComponentTemplateEntries: [],
        _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-439-478-Text", [{
          templateLiteral: null,
          prop: "className",
          target: "style",
          rawEntries: [{
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
          entries: {
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
          },
          metadata: {
            hasAnimations: false,
            hasGroupEvents: true,
            hasPointerEvents: true,
            isGroupParent: true
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
      _twinComponentID: "/fixtures/out.tsx-1055-1140-Pressable",
      _twinComponentTemplateEntries: [{
        id: "/fixtures/out.tsx-1055-1140-Pressable",
        target: "style",
        prop: "className",
        entries: require('@native-twin/core').tw(`${buttonVariants(props)}`),
        templateLiteral: `${buttonVariants(props)}`
      }],
      _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-1055-1140-Pressable", [{
        templateLiteral: null,
        prop: "className",
        target: "style",
        rawEntries: [],
        entries: {
          base: [],
          dark: [],
          pointer: [],
          group: [],
          even: [],
          first: [],
          last: [],
          odd: []
        },
        metadata: {
          hasAnimations: false,
          hasGroupEvents: true,
          hasPointerEvents: true,
          isGroupParent: true
        }
      }]),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        _twinOrd: 0,
        _twinComponentID: "/fixtures/out.tsx-1107-1123-Text",
        _twinComponentTemplateEntries: [],
        _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-1107-1123-Text", []),
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
      _twinComponentID: "/fixtures/out.tsx-1235-2564-View",
      _twinComponentTemplateEntries: [],
      _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-1235-2564-View", [{
        templateLiteral: null,
        prop: "className",
        target: "style",
        rawEntries: [{
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
        entries: {
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
        },
        metadata: {
          hasAnimations: false,
          hasGroupEvents: true,
          hasPointerEvents: true,
          isGroupParent: true
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
        _twinComponentID: "/fixtures/out.tsx-1291-1677-View",
        _twinComponentTemplateEntries: [],
        _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-1291-1677-View", [{
          templateLiteral: null,
          prop: "className",
          target: "style",
          rawEntries: [{
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
          }],
          entries: {
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
            }],
            dark: [],
            pointer: [],
            group: [],
            even: [],
            first: [],
            last: [],
            odd: []
          },
          metadata: {
            hasAnimations: false,
            hasGroupEvents: true,
            hasPointerEvents: true,
            isGroupParent: true
          }
        }]),
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          className: "p-2 !bg-green-800",
          _twinOrd: 0,
          _twinComponentID: "/fixtures/out.tsx-1427-1663-View",
          _twinComponentTemplateEntries: [],
          _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-1427-1663-View", [{
            templateLiteral: null,
            prop: "className",
            target: "style",
            rawEntries: [{
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
            }],
            entries: {
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
              }],
              dark: [],
              pointer: [],
              group: [],
              even: [],
              first: [],
              last: [],
              odd: []
            },
            metadata: {
              hasAnimations: false,
              hasGroupEvents: true,
              hasPointerEvents: true,
              isGroupParent: true
            }
          }]),
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            className: `
              text(center xl primary)
              hover:text-gray-700
              `,
            _twinOrd: 0,
            _twinComponentID: "/fixtures/out.tsx-1474-1647-Text",
            _twinComponentTemplateEntries: [],
            _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-1474-1647-Text", [{
              templateLiteral: null,
              prop: "className",
              target: "style",
              rawEntries: [{
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
              entries: {
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
              },
              metadata: {
                hasAnimations: false,
                hasGroupEvents: true,
                hasPointerEvents: true,
                isGroupParent: true
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
        _twinComponentID: "/fixtures/out.tsx-1684-2552-View",
        _twinComponentTemplateEntries: [],
        _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-1684-2552-View", [{
          templateLiteral: null,
          prop: "className",
          target: "style",
          rawEntries: [{
            className: "group",
            declarations: [],
            selectors: [],
            precedence: 805306368,
            important: false,
            animations: []
          }, {
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
          }, {
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
          entries: {
            base: [{
              className: "group",
              declarations: [],
              selectors: [],
              precedence: 805306368,
              important: false,
              animations: []
            }, {
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
          },
          metadata: {
            hasAnimations: false,
            hasGroupEvents: true,
            hasPointerEvents: true,
            isGroupParent: true
          }
        }]),
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          className: `
            text-2xl
            ${active ? 'text-red-800' : 'text-primary'}
          `,
          _twinOrd: 0,
          _twinComponentID: "/fixtures/out.tsx-1847-2019-Text",
          _twinComponentTemplateEntries: [{
            id: "/fixtures/out.tsx-1847-2019-Text",
            target: "style",
            prop: "className",
            entries: require('@native-twin/core').tw(`${active ? 'text-red-800' : 'text-primary'}`),
            templateLiteral: `${active ? 'text-red-800' : 'text-primary'}`
          }],
          _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-1847-2019-Text", [{
            templateLiteral: null,
            prop: "className",
            target: "style",
            rawEntries: [{
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
            }],
            entries: {
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
              }],
              dark: [],
              pointer: [],
              group: [],
              even: [],
              first: [],
              last: [],
              odd: []
            },
            metadata: {
              hasAnimations: false,
              hasGroupEvents: true,
              hasPointerEvents: true,
              isGroupParent: true
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
          _twinComponentID: "/fixtures/out.tsx-2028-2219-Pressable",
          _twinComponentTemplateEntries: [],
          _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-2028-2219-Pressable", []),
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            className: "text-gray-200",
            _twinOrd: 0,
            _twinComponentID: "/fixtures/out.tsx-2151-2198-Text",
            _twinComponentTemplateEntries: [],
            _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-2151-2198-Text", [{
              templateLiteral: null,
              prop: "className",
              target: "style",
              rawEntries: [{
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
              }],
              entries: {
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
                }],
                dark: [],
                pointer: [],
                group: [],
                even: [],
                first: [],
                last: [],
                odd: []
              },
              metadata: {
                hasAnimations: false,
                hasGroupEvents: true,
                hasPointerEvents: true,
                isGroupParent: true
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
          _twinComponentID: "/fixtures/out.tsx-2228-2538-View",
          _twinComponentTemplateEntries: [],
          _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-2228-2538-View", [{
            templateLiteral: null,
            prop: "className",
            target: "style",
            rawEntries: [{
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
            }, {
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
            entries: {
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
            },
            metadata: {
              hasAnimations: false,
              hasGroupEvents: true,
              hasPointerEvents: true,
              isGroupParent: true
            }
          }]),
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            suppressHighlighting: true,
            className: "text-gray-800 group-hover:text-white",
            _twinOrd: 0,
            _twinComponentID: "/fixtures/out.tsx-2361-2522-Text",
            _twinComponentTemplateEntries: [],
            _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/out.tsx-2361-2522-Text", [{
              templateLiteral: null,
              prop: "className",
              target: "style",
              rawEntries: [{
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
              entries: {
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
              },
              metadata: {
                hasAnimations: false,
                hasGroupEvents: true,
                hasPointerEvents: true,
                isGroupParent: true
              }
            }]),
            children: "Deeply nested hover"
          })
        })]
      })]
    });
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);