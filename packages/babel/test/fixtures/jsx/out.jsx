// @ts-noCheck
import { View, Text } from 'react-native';
import { jsx as _jsx } from "@native-twin/jsx/jsx-runtime";
import { jsxs as _jsxs } from "@native-twin/jsx/jsx-runtime";
export default function App() {
  return _jsxs(View, {
    styledProps: {
      "entries": [{
        "className": "flex-1",
        "declarations": [{
          "prop": "flex",
          "value": "1 1 0%"
        }],
        "selectors": [],
        "precedence": 0,
        "important": false,
        "animations": [],
        "index": 0
      }],
      "prop": "className",
      "target": "style"
    },
    children: [_jsx(Text, {
      styledProps: {
        "entries": [{
          "className": "text-lg",
          "declarations": [{
            "prop": "fontSize",
            "value": "1.125rem"
          }],
          "selectors": [],
          "precedence": 0,
          "important": false,
          "animations": [],
          "index": 1
        }],
        "prop": "className",
        "target": "style"
      },
      children: "Hello World"
    }), _jsx(Text, {
      entries_expressions: ["style", `${true && 'text-xl'}`],
      styledProps: {
        "entries": [],
        "prop": "className",
        "target": "style"
      },
      children: "Hello World"
    })]
  });
}