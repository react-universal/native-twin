// @ts-noCheck
import { View, Text } from 'react-native';
const __twinGlobal__sheet = require(".cache/native-twin/twin.styles");
export default function App() {
  return <View className='flex-1' _twinComponentSheet={require("@native-twin/jsx").StyleSheet.registerComponent("_mockTs2-1", [{
    "prop": "className",
    "target": "style",
    "templateLiteral": "",
    "entries": [__twinGlobal__sheet["flex-1"]],
    "metadata": {
      "hasAnimations": false,
      "hasGroupEvents": false,
      "hasPointerEvents": false,
      "isGroupParent": false
    }
  }])} _twinComponentID="_mockTs3-1">
      <Text className='text-lg' firstChild={true} ord={0} _twinComponentSheet={require("@native-twin/jsx").StyleSheet.registerComponent("_mockTs6-1", [{
      "prop": "className",
      "target": "style",
      "templateLiteral": "",
      "entries": [__twinGlobal__sheet["text-lg"]],
      "metadata": {
        "hasAnimations": false,
        "hasGroupEvents": false,
        "hasPointerEvents": false,
        "isGroupParent": false
      }
    }])} _twinComponentID="_mockTs7-1">Hello World</Text>
      <Text className={`
        flex-1 items-center justify-center md:border-3
        hover:(web:(bg-blue-600) ios:(bg-green-600) android:(bg-purple))
        ios:(p-14 bg-rose-200 border-black border-2 dark:(bg-blue-500))
        android:(p-14 border-green-200 border-2 bg-gray-800 dark:(bg-purple-500))
        md:(m-10)
        ${true && 'text-xl'}
        `} ord={1} __classNameExpression={`${true && 'text-xl'}`} _twinComponentSheet={require("@native-twin/jsx").StyleSheet.registerComponent("_mockTs10-1", [{
      "prop": "className",
      "target": "style",
      "templateLiteral": `${true && 'text-xl'}`,
      "entries": [__twinGlobal__sheet["flex-1"], __twinGlobal__sheet["items-center"], __twinGlobal__sheet["justify-center"], __twinGlobal__sheet["md:border-3"], __twinGlobal__sheet["web:hover:bg-blue-600"], __twinGlobal__sheet["ios:hover:bg-green-600"], __twinGlobal__sheet["android:hover:bg-purple"], __twinGlobal__sheet["ios:p-14"], __twinGlobal__sheet["ios:bg-rose-200"], __twinGlobal__sheet["ios:border-black"], __twinGlobal__sheet["ios:border-2"], __twinGlobal__sheet["dark:ios:bg-blue-500"], __twinGlobal__sheet["android:p-14"], __twinGlobal__sheet["android:border-green-200"], __twinGlobal__sheet["android:border-2"], __twinGlobal__sheet["android:bg-gray-800"], __twinGlobal__sheet["dark:android:bg-purple-500"], __twinGlobal__sheet["md:m-10"]],
      "metadata": {
        "hasAnimations": false,
        "hasGroupEvents": false,
        "hasPointerEvents": true,
        "isGroupParent": false
      }
    }])} _twinComponentID="_mockTs11-1">
        Hello World
      </Text>
      <View className='flex-1' ord={2} lastChild={true} _twinComponentSheet={require("@native-twin/jsx").StyleSheet.registerComponent("_mockTs14-1", [{
      "prop": "className",
      "target": "style",
      "templateLiteral": "",
      "entries": [__twinGlobal__sheet["flex-1"]],
      "metadata": {
        "hasAnimations": false,
        "hasGroupEvents": false,
        "hasPointerEvents": false,
        "isGroupParent": false
      }
    }])} _twinComponentID="_mockTs15-1" />
    </View>;
}