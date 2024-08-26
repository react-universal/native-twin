// @ts-noCheck
import { useState } from 'react';
import { Text, View } from 'react-native';
const ChildProp = () => {
  return <View className='first:bg-blue-600 last:bg-red-500 flex-1' _twinComponentID={"165982019"} _twinOrd={-1} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("165982019", [{
    templateLiteral: null,
    prop: "className",
    target: "style",
    entries: [{
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
    }, {
      className: "last:bg-red-500",
      declarations: [{
        prop: "backgroundColor",
        value: "rgba(239,68,68,1)",
        _tag: "COMPILED"
      }],
      selectors: ["last", "&:last"],
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
      first: [],
      last: [],
      odd: []
    }
  }])}>
      <View className='' _twinComponentID={"692033303"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("692033303", [{
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
        <Text className='' _twinComponentID={"-859277652"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-859277652", [{
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
      }])}>Text1</Text>
      </View>
      <View className='' _twinComponentID={"-1837935718"} _twinOrd={1} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-1837935718", [{
      templateLiteral: null,
      prop: "className",
      target: "style",
      entries: [],
      rawSheet: {
        base: [{
          className: "last:bg-red-500",
          declarations: [{
            prop: "backgroundColor",
            value: "rgba(239,68,68,1)",
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
        <Text className='' _twinComponentID={"-1566567607"} _twinOrd={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("-1566567607", [{
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