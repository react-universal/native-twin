// @ts-noCheck
import { View, Text } from 'react-native';
import { jsx as _jsx } from "@native-twin/jsx/jsx-runtime";
const buttonVariants = createVariants({
  base: 'py-5 m-1 rounded-md items-center justify-center group-hover:bg-red-400',
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
export const Button = props => {
  return _jsx(Pressable, {
    className: buttonVariants(props),
    _twinComponentTree: {
      node: "Pressable",
      order: 0,
      parentNode: null,
      childs: [{
        node: "Text",
        order: 0,
        parentNode: null,
        childs: [],
        id: "-2141225359",
        fileName: "/Users/christiangutierrez/work/native-twin/packages/babel/test/fixtures/jsx/code.tsx"
      }],
      id: "1321460211",
      fileName: "/Users/christiangutierrez/work/native-twin/packages/babel/test/fixtures/jsx/code.tsx"
    },
    _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("1321460211", [{
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
    }]),
    _twinComponentTemplateEntries: [{
      id: "1321460211",
      target: "style",
      prop: "className",
      entries: require('@native-twin/core').tw(`${buttonVariants(props)}`),
      templateLiteral: `${buttonVariants(props)}`
    }],
    _twinComponentID: "1321460211",
    _twinOrd: 0,
    children: _jsx(Text, {
      className: "group-hover:text-white",
      _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("-2141225359", [{
        templateLiteral: null,
        prop: "className",
        target: "style",
        entries: [{
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
        rawSheet: {
          base: [],
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
      _twinComponentTemplateEntries: [],
      _twinComponentID: "-2141225359",
      _twinOrd: 0,
      children: "asd"
    })
  });
};
export default function App() {
  return _jsx(View, {
    className: `group flex-1 first:bg-red-200`,
    _twinComponentTree: {
      node: "View",
      order: 0,
      parentNode: null,
      childs: [{
        node: "Button",
        order: 0,
        parentNode: null,
        childs: [],
        id: "-195880899",
        fileName: "/Users/christiangutierrez/work/native-twin/packages/babel/test/fixtures/jsx/code.tsx"
      }],
      id: "-428933676",
      fileName: "/Users/christiangutierrez/work/native-twin/packages/babel/test/fixtures/jsx/code.tsx"
    },
    _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("-428933676", [{
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
        className: "first:bg-red-200",
        declarations: [{
          prop: "backgroundColor",
          value: "rgba(254,202,202,1)",
          _tag: "COMPILED"
        }],
        selectors: ["first", "&:first"],
        precedence: 805437440,
        important: false,
        animations: []
      }],
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
        }],
        dark: [],
        pointer: [],
        group: [],
        even: [],
        first: [{
          className: "first:bg-red-200",
          declarations: [{
            prop: "backgroundColor",
            value: "rgba(254,202,202,1)",
            _tag: "COMPILED"
          }],
          selectors: ["first", "&:first"],
          precedence: 805437440,
          important: false,
          animations: []
        }],
        last: [],
        odd: []
      }
    }]),
    _twinComponentTemplateEntries: [{
      id: "-428933676",
      target: "style",
      prop: "className",
      entries: require('@native-twin/core').tw(``),
      templateLiteral: ``
    }],
    _twinComponentID: "-428933676",
    _twinOrd: 0,
    children: _jsx(Button, {
      size: "small",
      _twinComponentSheet: require('@native-twin/jsx').StyleSheet.registerComponent("-195880899", []),
      _twinComponentTemplateEntries: [],
      _twinComponentID: "-195880899",
      _twinOrd: 0
    })
  });
}