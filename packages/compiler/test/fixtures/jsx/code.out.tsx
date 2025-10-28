// @ts-noCheck
const __TwinStoreHandler = require('@native-twin/styled');
const __ReactNativeStyleSheet = require('@native-twin/jsx').StyleSheet;
// @ts-noCheck
import { FlatList, View } from "react-native";
import { Button } from "./code-i";
export default function App() {
  return <View className={`group ${x ? 'asd' : 'x'} h-[20vh] flex-1 hover:bg-red shadow-md border-1 translate-x-2 rotate-1 first:bg-red-200 last:bg-blue-200`} __twinID={"617922210"} __parentID={null} __twinExpressions={{
    prop: "className",
    target: "style",
    expression: `${x ? 'asd' : 'x'}`
  }}>
      <Button size="small" __twinID={"103451141"} __parentID={"617922210"} />
      <FlatList data={[1, 2]} renderItem={({
      item
    }) => <View className="bg-gray-200" __twinID={"519118255"} __parentID={"101357255"}>
            <Text className="text-lg white" __twinID={"101711716"} __parentID={"519118255"}>Count {item}</Text>
          </View>} __twinID={"101357255"} __parentID={"617922210"} />
      <Text className="px-2 group-hover:bg-green" __twinID={"411454715"} __parentID={"617922210"}>Hello World</Text>
    </View>;
}
__ReactNativeStyleSheet.registerComponent([{
  "id": "617922210",
  "index": 0,
  "metadata": {
    "hasGroupEvents": false,
    "hasPointerEvents": true,
    "isGroupParent": false
  },
  "childIds": ["103451141", "101357255", "411454715"],
  "parentID": null,
  "parentSize": -1,
  "props": [{
    "entries": {
      "base": [{
        "className": "grouph-[20vh]",
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
    "classNames": "grouph-[20vh] flex-1 hover:bg-red shadow-md border-1 translate-x-2 rotate-1 first:bg-red-200 last:bg-blue-200",
    "templateEntries": "`${x ? 'asd' : 'x'}`",
    "metadata": {
      "hasGroupEvents": false,
      "hasPointerEvents": true,
      "isGroupParent": false
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
}, {
  "id": "103451141",
  "index": 0,
  "metadata": {
    "hasGroupEvents": false,
    "hasPointerEvents": false,
    "isGroupParent": false
  },
  "childIds": [],
  "parentID": "617922210",
  "parentSize": 3,
  "props": [],
  "childStyles": []
}, {
  "id": "101357255",
  "index": 1,
  "metadata": {
    "hasGroupEvents": false,
    "hasPointerEvents": false,
    "isGroupParent": false
  },
  "childIds": ["519118255"],
  "parentID": "617922210",
  "parentSize": 3,
  "props": [],
  "childStyles": []
}, {
  "id": "519118255",
  "index": 0,
  "metadata": {
    "hasGroupEvents": false,
    "hasPointerEvents": false,
    "isGroupParent": false
  },
  "childIds": ["101711716"],
  "parentID": "101357255",
  "parentSize": 1,
  "props": [{
    "entries": {
      "base": [{
        "className": "bg-gray-200",
        "important": false,
        "inherited": false,
        "precedence": 805306368,
        "group": "base",
        "groups": ["base"],
        "declarations": [{
          "_tag": "COMPILED",
          "prop": "backgroundColor",
          "value": "rgba(229,231,235,1)",
          "isUnitLess": false
        }]
      }],
      "child": [],
      "pointer": [],
      "group": []
    },
    "prop": "className",
    "target": "style",
    "classNames": "bg-gray-200",
    "templateEntries": "",
    "metadata": {
      "hasGroupEvents": false,
      "hasPointerEvents": false,
      "isGroupParent": false
    }
  }],
  "childStyles": []
}, {
  "id": "101711716",
  "index": 0,
  "metadata": {
    "hasGroupEvents": false,
    "hasPointerEvents": false,
    "isGroupParent": false
  },
  "childIds": [],
  "parentID": "519118255",
  "parentSize": 1,
  "props": [{
    "entries": {
      "base": [{
        "className": "text-lg",
        "important": false,
        "inherited": false,
        "precedence": 805306368,
        "group": "base",
        "groups": ["base"],
        "declarations": [{
          "_tag": "COMPILED",
          "prop": "fontSize",
          "value": 18,
          "isUnitLess": false
        }]
      }, {
        "className": "white",
        "important": false,
        "inherited": false,
        "precedence": 805306368,
        "group": "base",
        "groups": ["base"],
        "declarations": []
      }],
      "child": [],
      "pointer": [],
      "group": []
    },
    "prop": "className",
    "target": "style",
    "classNames": "text-lg white",
    "templateEntries": "",
    "metadata": {
      "hasGroupEvents": false,
      "hasPointerEvents": false,
      "isGroupParent": false
    }
  }],
  "childStyles": []
}, {
  "id": "411454715",
  "index": 2,
  "metadata": {
    "hasGroupEvents": true,
    "hasPointerEvents": false,
    "isGroupParent": false
  },
  "childIds": [],
  "parentID": "617922210",
  "parentSize": 3,
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
    "classNames": "px-2 group-hover:bg-green",
    "templateEntries": "",
    "metadata": {
      "hasGroupEvents": true,
      "hasPointerEvents": false,
      "isGroupParent": false
    }
  }],
  "childStyles": []
}]);