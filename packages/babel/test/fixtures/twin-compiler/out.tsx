// @ts-noCheck
import { useState } from 'react';
import { Text, View } from 'react-native';
const ChildProp = () => {
  return <View className='first:bg-blue-600' _twinComponentID={"-527438375#_twin_root"} _twinOrd={-1} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-527438375#_twin_root", [{
    templateLiteral: null,
    prop: "className",
    target: "style",
    entries: [{
      className: "first:bg-blue-600",
      declarations: [{
        prop: "backgroundColor",
        value: "rgba(37,99,235,1)",
        _tag: "COMPILED"
      }],
      selectors: ["first", "&:first"],
      precedence: 805437440,
      important: false,
      animations: []
    }],
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
  }])} _twinComponentTemplateEntries={[]}>
      <View className={`
          group
          flex-[2] items-center justify-center
          bg-blue-800 hover:bg-red-600
        `} _twinComponentID={"-527438375#_twin_root:0"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-527438375#_twin_root:0", [{
      templateLiteral: null,
      prop: "className",
      target: "style",
      entries: [{
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
        className: "items-center",
        declarations: [{
          prop: "alignItems",
          value: "center",
          _tag: "COMPILED"
        }],
        selectors: [],
        precedence: 805306368,
        important: false,
        animations: []
      }, {
        className: "justify-center",
        declarations: [{
          prop: "justifyContent",
          value: "center",
          _tag: "COMPILED"
        }],
        selectors: [],
        precedence: 805306368,
        important: false,
        animations: []
      }, {
        className: "bg-blue-800",
        declarations: [{
          prop: "backgroundColor",
          value: "rgba(30,64,175,1)",
          _tag: "COMPILED"
        }],
        selectors: [],
        precedence: 805306368,
        important: false,
        animations: []
      }, {
        className: "hover:bg-red-600",
        declarations: [{
          prop: "backgroundColor",
          value: "rgba(220,38,38,1)",
          _tag: "COMPILED"
        }],
        selectors: ["hover", "&:hover"],
        precedence: 805307392,
        important: false,
        animations: []
      }],
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
          className: "items-center",
          declarations: [{
            prop: "alignItems",
            value: "center",
            _tag: "COMPILED"
          }],
          selectors: [],
          precedence: 805306368,
          important: false,
          animations: []
        }, {
          className: "justify-center",
          declarations: [{
            prop: "justifyContent",
            value: "center",
            _tag: "COMPILED"
          }],
          selectors: [],
          precedence: 805306368,
          important: false,
          animations: []
        }, {
          className: "bg-blue-800",
          declarations: [{
            prop: "backgroundColor",
            value: "rgba(30,64,175,1)",
            _tag: "COMPILED"
          }],
          selectors: [],
          precedence: 805306368,
          important: false,
          animations: []
        }, {
          className: "first:bg-blue-600",
          declarations: [{
            prop: "backgroundColor",
            value: "rgba(37,99,235,1)",
            _tag: "COMPILED"
          }],
          selectors: ["first", "&:first"],
          precedence: 805437440,
          important: false,
          animations: []
        }],
        dark: [],
        pointer: [{
          className: "hover:bg-red-600",
          declarations: [{
            prop: "backgroundColor",
            value: "rgba(220,38,38,1)",
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
    }])} _twinComponentTemplateEntries={[{
      id: "-527438375#_twin_root:0",
      target: "style",
      prop: "className",
      entries: require('@native-twin/core').tw(``),
      templateLiteral: ``
    }]}>
        <Text className='' _twinComponentID={"-527438375#_twin_root:0:0"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-527438375#_twin_root:0:0", [{
        templateLiteral: null,
        prop: "className",
        target: "style",
        entries: [],
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
      }])} _twinComponentTemplateEntries={[]}>Text1</Text>
      </View>
      <View className='' _twinComponentID={"-527438375#_twin_root:1"} _twinOrd={1} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-527438375#_twin_root:1", [{
      templateLiteral: null,
      prop: "className",
      target: "style",
      entries: [],
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
    }])} _twinComponentTemplateEntries={[]}>
        <Text className='' _twinComponentID={"-527438375#_twin_root:1:0"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-527438375#_twin_root:1:0", [{
        templateLiteral: null,
        prop: "className",
        target: "style",
        entries: [],
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
      }])} _twinComponentTemplateEntries={[]}>Text2</Text>
      </View>
    </View>;
};
const Button = () => {
  return <View className='bg-black last:text-lg odd:text-gray-200 even:text-yellow-200' _twinComponentID={"-527438375#_twin_root2"} _twinOrd={-1} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-527438375#_twin_root2", [{
    templateLiteral: null,
    prop: "className",
    target: "style",
    entries: [{
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
    }, {
      className: "odd:text-gray-200",
      declarations: [{
        prop: "color",
        value: "rgba(229,231,235,1)",
        _tag: "COMPILED"
      }],
      selectors: ["odd", "&:odd"],
      precedence: 805437440,
      important: false,
      animations: []
    }, {
      className: "even:text-yellow-200",
      declarations: [{
        prop: "color",
        value: "rgba(254,240,138,1)",
        _tag: "COMPILED"
      }],
      selectors: ["even", "&:even"],
      precedence: 805437440,
      important: false,
      animations: []
    }],
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
  }])} _twinComponentTemplateEntries={[]}>
      <Text className='font-medium' _twinComponentID={"-527438375#_twin_root2:0"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-527438375#_twin_root2:0", [{
      templateLiteral: null,
      prop: "className",
      target: "style",
      entries: [{
        className: "font-medium",
        declarations: [{
          prop: "fontWeight",
          value: 500,
          _tag: "COMPILED"
        }],
        selectors: [],
        precedence: 805306368,
        important: false,
        animations: []
      }],
      rawSheet: {
        base: [{
          className: "font-medium",
          declarations: [{
            prop: "fontWeight",
            value: 500,
            _tag: "COMPILED"
          }],
          selectors: [],
          precedence: 805306368,
          important: false,
          animations: []
        }, {
          className: "odd:text-gray-200",
          declarations: [{
            prop: "color",
            value: "rgba(229,231,235,1)",
            _tag: "COMPILED"
          }],
          selectors: ["odd", "&:odd"],
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
    }])} _twinComponentTemplateEntries={[]}>Text1</Text>
      <Text className='font-bold' _twinComponentID={"-527438375#_twin_root2:1"} _twinOrd={1} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-527438375#_twin_root2:1", [{
      templateLiteral: null,
      prop: "className",
      target: "style",
      entries: [{
        className: "font-bold",
        declarations: [{
          prop: "fontWeight",
          value: 700,
          _tag: "COMPILED"
        }],
        selectors: [],
        precedence: 805306368,
        important: false,
        animations: []
      }],
      rawSheet: {
        base: [{
          className: "font-bold",
          declarations: [{
            prop: "fontWeight",
            value: 700,
            _tag: "COMPILED"
          }],
          selectors: [],
          precedence: 805306368,
          important: false,
          animations: []
        }, {
          className: "even:text-yellow-200",
          declarations: [{
            prop: "color",
            value: "rgba(254,240,138,1)",
            _tag: "COMPILED"
          }],
          selectors: ["even", "&:even"],
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
    }])} _twinComponentTemplateEntries={[]}>Text2</Text>
      <Text className={`${true ? 'text-medium' : 'text-bold'}`} _twinComponentID={"-527438375#_twin_root2:2"} _twinOrd={2} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-527438375#_twin_root2:2", [{
      templateLiteral: null,
      prop: "className",
      target: "style",
      entries: [],
      rawSheet: {
        base: [{
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
        }, {
          className: "odd:text-gray-200",
          declarations: [{
            prop: "color",
            value: "rgba(229,231,235,1)",
            _tag: "COMPILED"
          }],
          selectors: ["odd", "&:odd"],
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
    }])} _twinComponentTemplateEntries={[{
      id: "-527438375#_twin_root2:2",
      target: "style",
      prop: "className",
      entries: require('@native-twin/core').tw(`${true ? 'text-medium' : 'text-bold'}`),
      templateLiteral: `${true ? 'text-medium' : 'text-bold'}`
    }]}>Text3</Text>
    </View>;
};
export { ChildProp };