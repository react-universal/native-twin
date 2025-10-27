// @ts-noCheck
import { styledJSXStore as __TwinStoreHandler } from '@native-twin/styled';
const __ReactNativeStyleSheet = require('@native-twin/styled').TwinStyleSheet;
// @ts-noCheck
import { View } from 'react-native';
import { Button } from './code-i';
export default function App() {
  return <View className={`group flex-1 hover:bg-red shadow-md border-1 translate-x-2 rotate-1 first:bg-red-200 last:bg-blue-200`} __twinID={"872629236"} __parentID={null}>
      <Button size='small' __twinID={"103451141"} __parentID={"872629236"} />
       <Text className='px-2 group-hover:bg-green' __twinID={"411454715"} __parentID={"872629236"}>Hello World</Text>
    </View>;
}
__TwinStoreHandler.registerComponent({
  "id": "872629236",
  "index": 0,
  "metadata": {
    "hasGroupEvents": false,
    "hasPointerEvents": true,
    "isGroupParent": true
  },
  "parentID": null,
  "parentSize": -1,
  "props": [{
    "entries": {
      "base": [{
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
      "child": [{
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
      }],
      "pointer": [{
        "className": "hover:bg-red",
        "important": false,
        "inherited": false,
        "precedence": 805307392,
        "group": "pointer",
        "groups": ["pointer"],
        "declarations": [{
          "_tag": "COMPILED",
          "prop": "backgroundColor",
          "value": "rgba(248,113,113,1)",
          "isUnitLess": false
        }]
      }],
      "group": []
    },
    "prop": "className",
    "target": "style",
    "metadata": {
      "hasGroupEvents": false,
      "hasPointerEvents": true,
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
__TwinStoreHandler.registerComponent({
  "id": "103451141",
  "index": 0,
  "metadata": {
    "hasGroupEvents": false,
    "hasPointerEvents": false,
    "isGroupParent": false
  },
  "parentID": "872629236",
  "parentSize": 2,
  "props": [],
  "childStyles": []
});
__TwinStoreHandler.registerComponent({
  "id": "411454715",
  "index": 1,
  "metadata": {
    "hasGroupEvents": true,
    "hasPointerEvents": false,
    "isGroupParent": false
  },
  "parentID": "872629236",
  "parentSize": 2,
  "props": [{
    "entries": {
      "base": [{
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
      }],
      "child": [],
      "pointer": [],
      "group": [{
        "className": "group-hover:bg-green",
        "important": false,
        "inherited": false,
        "precedence": 805307392,
        "group": "group",
        "groups": ["group"],
        "declarations": [{
          "_tag": "COMPILED",
          "prop": "backgroundColor",
          "value": "rgba(74,222,128,1)",
          "isUnitLess": false
        }]
      }]
    },
    "prop": "className",
    "target": "style",
    "metadata": {
      "hasGroupEvents": true,
      "hasPointerEvents": false,
      "isGroupParent": false
    }
  }],
  "childStyles": []
});