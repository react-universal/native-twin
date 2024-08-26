// @ts-noCheck
import { useState } from 'react';
import { Text, View } from 'react-native';
const ChildProp = () => {
  return <View className='first:bg-blue-600' _twinComponentID={"681870870"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("681870870", [{
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
      <View className='' _twinComponentID={"372809332"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("372809332", [{
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
        <Text className='' _twinComponentID={"302335177"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("302335177", [{
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
      <View className='' _twinComponentID={"1979447406"} _twinOrd={1} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("1979447406", [{
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
        <Text className='' _twinComponentID={"-739227011"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-739227011", [{
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