// @ts-noCheck
import { useState } from 'react';
import { Text, View } from 'react-native';
const ChildProp = () => {
  return <View className='first:bg-blue-600' _twinComponentID={"-1153348929"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-1153348929", [{
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
  }])}>
      <View className='' _twinComponentID={"-2092498152"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-2092498152", [{
      templateLiteral: null,
      prop: "className",
      target: "style",
      entries: [],
      rawSheet: {
        base: [{
          className: "first:bg-blue-600",
          declarations: [{
            prop: "backgroundColor",
            value: "rgba(37,99,235,1)",
            _tag: "COMPILED"
          }],
          selectors: [],
          precedence: 805437440,
          important: false,
          animations: []
        }, {
          className: "first:bg-blue-600",
          declarations: [{
            prop: "backgroundColor",
            value: "rgba(37,99,235,1)",
            _tag: "COMPILED"
          }],
          selectors: [],
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
    }])}>
        <Text className='' _twinComponentID={"1644819331"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("1644819331", [{
        templateLiteral: null,
        prop: "className",
        target: "style",
        entries: [],
        rawSheet: {
          base: [{
            className: "first:bg-blue-600",
            declarations: [{
              prop: "backgroundColor",
              value: "rgba(37,99,235,1)",
              _tag: "COMPILED"
            }],
            selectors: [],
            precedence: 805437440,
            important: false,
            animations: []
          }, {
            className: "first:bg-blue-600",
            declarations: [{
              prop: "backgroundColor",
              value: "rgba(37,99,235,1)",
              _tag: "COMPILED"
            }],
            selectors: [],
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
      </View>
      <View className='' _twinComponentID={"-1621575534"} _twinOrd={1} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-1621575534", [{
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
    }])}>
        <Text className='' _twinComponentID={"2001709018"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("2001709018", [{
        templateLiteral: null,
        prop: "className",
        target: "style",
        entries: [],
        rawSheet: {
          base: [{
            className: "first:bg-blue-600",
            declarations: [{
              prop: "backgroundColor",
              value: "rgba(37,99,235,1)",
              _tag: "COMPILED"
            }],
            selectors: [],
            precedence: 805437440,
            important: false,
            animations: []
          }, {
            className: "first:bg-blue-600",
            declarations: [{
              prop: "backgroundColor",
              value: "rgba(37,99,235,1)",
              _tag: "COMPILED"
            }],
            selectors: [],
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
      </View>
    </View>;
};

// const Button = () => {
//   return (
//     <View className='bg-black last:text-lg odd:text-gray-200 even:text-yellow-200'>
//       <Text className='font-medium'>Text1</Text>
//       <Text className='font-bold'>Text2</Text>
//       <Text className={`${true ? 'text-medium' : 'text-bold'}`}>Text3</Text>
//     </View>
//   );
// };

export { ChildProp };