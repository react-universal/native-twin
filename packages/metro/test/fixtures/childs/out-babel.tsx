// @ts-noCheck
import { useState } from 'react';
import { Text, View } from 'react-native';
const ChildProp = () => {
  return <View className='bg-black last:text-lg odd:text-gray-200 even:text-yellow-200' _twinOrd={0} _twinComponentID={"a-660560371"} _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("a-660560371", [{
    templateLiteral: null,
    prop: "className",
    target: "style",
    entries: [globalStyles.get("bg-black"), globalStyles.get("last:text-lg"), globalStyles.get("odd:text-gray-200"), globalStyles.get("even:text-yellow-200")].filter(Boolean),
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
  }])}>
      <Text className='font-medium' _twinOrd={0} _twinComponentID={"a:a-1160712654"} _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("a:a-1160712654", [{
      templateLiteral: null,
      prop: "className",
      target: "style",
      entries: [globalStyles.get("font-medium")].filter(Boolean),
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
    }])}>Text1</Text>
      <Text className='font-bold' _twinOrd={1} _twinComponentID={"a:b-1154500572"} _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("a:b-1154500572", [{
      templateLiteral: null,
      prop: "className",
      target: "style",
      entries: [globalStyles.get("font-bold")].filter(Boolean),
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
    }])}>Text2</Text>
      <Text className='font-medium' _twinOrd={2} _twinComponentID={"a:c-1154576646"} _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("a:c-1154576646", [{
      templateLiteral: null,
      prop: "className",
      target: "style",
      entries: [globalStyles.get("font-medium")].filter(Boolean),
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
    }])}>Text3</Text>
    </View>;
};
export { ChildProp };