// @ts-noCheck
const __ReactNativeStyleSheet = require('@native-twin/styled').TwinStyleSheet;
// @ts-noCheck
import { View } from 'react-native';
import { Button } from './code-i';
export default function App() {
  return <View className={`group flex-1 shadow-md border-1 translate-x-2 rotate-1 first:bg-red-200 last:bg-blue-200`} style={__ReactNativeStyleSheet.getComponentStyles("286613378", "className", false)} __twinID={"286613378"}>
      <Button size='small' />
       <Text className='px-2' style={__ReactNativeStyleSheet.getComponentStyles("766331662", "className", false)} __twinID={"766331662"}>Hello World</Text>
      {/*<Text>Hello World</Text>
       <View className='flex-1 first:bg-blue-200'>
        <Text className='text-lg'>Test Text</Text>
        <Text className='text-lg'>Test Text2</Text>
       </View> */}
    </View>;
}
const _____Twin__Module__Styles = {};
__ReactNativeStyleSheet.registerComponent({
  "id": "286613378",
  "index": 0,
  "metadata": {
    "hasGroupEvents": false,
    "hasPointerEvents": false,
    "isGroupParent": true
  },
  "parentID": null,
  "parentSize": -1,
  "props": [{
    "entries": [{
      "className": "group",
      "important": false,
      "inherited": false,
      "precedence": 805306368,
      "group": "base",
      "groups": ["base"],
      "declarations": []
    }, {
      "className": "flex-1",
      "important": false,
      "inherited": false,
      "precedence": 805306368,
      "group": "base",
      "groups": ["base"],
      "declarations": [{
        "_tag": "COMPILED",
        "prop": "flex",
        "value": {
          "flexGrow": 1,
          "flexShrink": 1,
          "flexBasis": "0%"
        },
        "isUnitLess": false
      }]
    }, {
      "className": "shadow-md",
      "important": false,
      "inherited": false,
      "precedence": 805306368,
      "group": "base",
      "groups": ["base"],
      "declarations": [{
        "_tag": "COMPILED",
        "prop": "shadowRadius",
        "value": {
          "shadowOffset": {
            "width": 0,
            "height": 4
          },
          "shadowColor": "rgb(0,0,0)",
          "shadowRadius": 6,
          "shadowOpacity": 0.3,
          "elevation": 3
        },
        "isUnitLess": false
      }]
    }, {
      "className": "border-1",
      "important": false,
      "inherited": false,
      "precedence": 805306368,
      "group": "base",
      "groups": ["base"],
      "declarations": [{
        "_tag": "COMPILED",
        "prop": "borderWidth",
        "value": 1,
        "isUnitLess": false
      }]
    }, {
      "className": "translate-x-2",
      "important": false,
      "inherited": false,
      "precedence": 805306368,
      "group": "base",
      "groups": ["base"],
      "declarations": [{
        "_tag": "COMPILED",
        "prop": "transform",
        "value": [{
          "_tag": "COMPILED",
          "prop": "translateX",
          "value": 8,
          "isUnitLess": false
        }],
        "isUnitLess": false
      }]
    }, {
      "className": "rotate-1",
      "important": false,
      "inherited": false,
      "precedence": 805306368,
      "group": "base",
      "groups": ["base"],
      "declarations": [{
        "_tag": "COMPILED",
        "prop": "transform",
        "value": [{
          "_tag": "COMPILED",
          "prop": "rotate",
          "value": "1deg",
          "isUnitLess": false
        }],
        "isUnitLess": false
      }]
    }],
    "prop": "className",
    "target": "style",
    "metadata": {
      "hasGroupEvents": false,
      "hasPointerEvents": false,
      "isGroupParent": true
    }
  }],
  "childStyles": [{
    "className": "first:bg-red-200",
    "important": false,
    "inherited": false,
    "precedence": 805437440,
    "group": "first",
    "groups": ["first"],
    "declarations": [{
      "_tag": "COMPILED",
      "prop": "backgroundColor",
      "value": "rgba(254,202,202,1)",
      "isUnitLess": false
    }]
  }, {
    "className": "last:bg-blue-200",
    "important": false,
    "inherited": false,
    "precedence": 805437440,
    "group": "last",
    "groups": ["last"],
    "declarations": [{
      "_tag": "COMPILED",
      "prop": "backgroundColor",
      "value": "rgba(191,219,254,1)",
      "isUnitLess": false
    }]
  }]
});
__ReactNativeStyleSheet.registerComponent({
  "id": "450999280",
  "index": 0,
  "metadata": {
    "hasGroupEvents": false,
    "hasPointerEvents": false,
    "isGroupParent": false
  },
  "parentID": "286613378",
  "parentSize": 2,
  "props": [],
  "childStyles": []
});
__ReactNativeStyleSheet.registerComponent({
  "id": "766331662",
  "index": 1,
  "metadata": {
    "hasGroupEvents": false,
    "hasPointerEvents": false,
    "isGroupParent": false
  },
  "parentID": "286613378",
  "parentSize": 2,
  "props": [{
    "entries": [{
      "className": "px-2",
      "important": false,
      "inherited": false,
      "precedence": 805306368,
      "group": "base",
      "groups": ["base"],
      "declarations": [{
        "_tag": "COMPILED",
        "prop": "paddingLeft",
        "value": 8,
        "isUnitLess": false
      }, {
        "_tag": "COMPILED",
        "prop": "paddingRight",
        "value": 8,
        "isUnitLess": false
      }]
    }, {
      "className": "last:bg-blue-200",
      "important": false,
      "inherited": true,
      "precedence": 805437440,
      "group": "last",
      "groups": ["last"],
      "declarations": [{
        "_tag": "COMPILED",
        "prop": "backgroundColor",
        "value": "rgba(191,219,254,1)",
        "isUnitLess": false
      }]
    }],
    "prop": "className",
    "target": "style",
    "metadata": {
      "hasGroupEvents": false,
      "hasPointerEvents": false,
      "isGroupParent": false
    }
  }],
  "childStyles": []
});