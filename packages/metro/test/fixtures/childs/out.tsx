// @ts-noCheck
import { useState } from 'react';
import { Text, View } from 'react-native';
const ChildProp = () => {
  return <View className='first:bg-blue-600' _twinComponentID={"-1828439741"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-1828439741", [{
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
      <View className='' _twinComponentID={"-175847491"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-175847491", [{
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
        <Text className='' _twinComponentID={"-238801277"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-238801277", [{
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
      <View className='' _twinComponentID={"-308382856"} _twinOrd={1} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-308382856", [{
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
        <Text className='' _twinComponentID={"-1929193989"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-1929193989", [{
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