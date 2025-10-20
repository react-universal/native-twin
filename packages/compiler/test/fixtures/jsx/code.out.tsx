// @ts-noCheck
import { View } from 'react-native';
import { Button } from './code-i';
export default function App() {
  return <View className={`group flex-1 shadow-md border-1 translate-x-2 rotate-1 first:bg-red-200 last:bg-blue-200`}>
      <Button size='small' />
       <Text className='px-2'>Hello World</Text>
      {/*<Text>Hello World</Text>
       <View className='flex-1 first:bg-blue-200'>
        <Text className='text-lg'>Test Text</Text>
        <Text className='text-lg'>Test Text2</Text>
       </View> */}
    </View>;
}
const __Twin_StyleSheet_Handler = require("@native-twin/jsx");
const _____Twin__Module__Styles = {
  "__JSXElementNode_998016606_187520085_View": {
    "base": {
      "rawDecls": [{
        "_tag": "NOT_COMPILED",
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
        "isUnitLess": false,
        "valueType": "unknown",
        "reason": "Unknown"
      }],
      "styles": {
        "flexGrow": 1,
        "flexShrink": 1,
        "flexBasis": "0%",
        "borderWidth": 1,
        "transform": [{
          "rotate": "1deg"
        }]
      }
    },
    "child": {
      "even": {
        "rawDecls": [],
        "styles": {}
      },
      "first": {
        "rawDecls": [],
        "styles": {}
      },
      "last": {
        "rawDecls": [],
        "styles": {}
      },
      "odd": {
        "rawDecls": [],
        "styles": {}
      }
    },
    "dark": {
      "rawDecls": [],
      "styles": {}
    },
    "group": {
      "rawDecls": [],
      "styles": {}
    },
    "pointer": {
      "rawDecls": [],
      "styles": {}
    },
    "isGroupParent": false
  },
  "__JSXElementNode_998016606_-888906948_Button": {
    "base": {
      "rawDecls": [],
      "styles": {}
    },
    "child": {
      "even": {
        "rawDecls": [],
        "styles": {}
      },
      "first": {
        "rawDecls": [],
        "styles": {
          "backgroundColor": "rgba(254,202,202,1)"
        }
      },
      "last": {
        "rawDecls": [],
        "styles": {}
      },
      "odd": {
        "rawDecls": [],
        "styles": {}
      }
    },
    "dark": {
      "rawDecls": [],
      "styles": {}
    },
    "group": {
      "rawDecls": [],
      "styles": {}
    },
    "pointer": {
      "rawDecls": [],
      "styles": {}
    },
    "isGroupParent": false
  },
  "__JSXElementNode_998016606_187520085_Text": {
    "base": {
      "rawDecls": [],
      "styles": {
        "paddingLeft": 8,
        "paddingRight": 8
      }
    },
    "child": {
      "even": {
        "rawDecls": [],
        "styles": {}
      },
      "first": {
        "rawDecls": [],
        "styles": {}
      },
      "last": {
        "rawDecls": [],
        "styles": {
          "backgroundColor": "rgba(191,219,254,1)"
        }
      },
      "odd": {
        "rawDecls": [],
        "styles": {}
      }
    },
    "dark": {
      "rawDecls": [],
      "styles": {}
    },
    "group": {
      "rawDecls": [],
      "styles": {}
    },
    "pointer": {
      "rawDecls": [],
      "styles": {}
    },
    "isGroupParent": false
  }
};