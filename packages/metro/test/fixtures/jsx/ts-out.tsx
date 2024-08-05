// @ts-noCheck
import { useState } from 'react';
import { Text, Image, Pressable, View, PressableProps } from 'react-native';
import { VariantProps, createVariants } from '@native-twin/styled';
import { TextField } from '../components/TextField';

const testImage = require('../../assets/favicon.png');

const ChildProp = () => {
  return (
    <View className='bg-black last:text-lg' _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-345-490-View" _twinComponentTemplateEntries={
              []
          } _twinComponentSheet={
              require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-345-490-View", [ {
                  templateLiteral: null,
                  prop: "className",
                  target: "style",
                  rawEntries: [ {
                          className: "bg-black",
                          declarations: [ {
                                  prop: "backgroundColor",
                                  value: "rgba(0,0,0,1)"
                              }
                              ],
                          selectors: [],
                          precedence: 805306368,
                          important: false,
                          animations: []
                      }
                      , {
                          className: "last:text-lg",
                          declarations: [ {
                                  prop: "fontSize",
                                  value: "1.125rem"
                              }
                              ],
                          selectors: ["last","&:last"],
                          precedence: 805437440,
                          important: false,
                          animations: []
                      }
                      ],
                  entries: {
                          base: [ {
                                  className: "bg-black",
                                  declarations: [ {
                                          prop: "backgroundColor",
                                          value: "rgba(0,0,0,1)"
                                      }
                                      ],
                                  selectors: [],
                                  precedence: 805306368,
                                  important: false,
                                  animations: []
                              }
                              ],
                          dark: [],
                          pointer: [],
                          group: [],
                          even: [],
                          first: [],
                          last: [],
                          odd: []
                      }
                  ,
                  metadata: {
                          hasAnimations: false,
                          hasGroupEvents: true,
                          hasPointerEvents: true,
                          isGroupParent: true
                      }
              }
              ])
          }>
      <Text className='text-blue' _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-392-432-Text" _twinComponentTemplateEntries={
                  []
              } _twinComponentSheet={
                  require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-392-432-Text", [ {
                      templateLiteral: null,
                      prop: "className",
                      target: "style",
                      rawEntries: [ {
                              className: "text-blue",
                              declarations: [ {
                                      prop: "color",
                                      value: "rgba(96,165,250,1)"
                                  }
                                  ],
                              selectors: [],
                              precedence: 805306368,
                              important: false,
                              animations: []
                          }
                          ],
                      entries: {
                              base: [ {
                                      className: "text-blue",
                                      declarations: [ {
                                              prop: "color",
                                              value: "rgba(96,165,250,1)"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  ],
                              dark: [],
                              pointer: [],
                              group: [],
                              even: [],
                              first: [],
                              last: [],
                              odd: []
                          }
                      ,
                      metadata: {
                              hasAnimations: false,
                              hasGroupEvents: false,
                              hasPointerEvents: true,
                              isGroupParent: false
                          }
                  }
                  ])
              }>Text1</Text>
      <Text className='text-red' _twinOrd={1} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-439-478-Text" _twinComponentTemplateEntries={
                  []
              } _twinComponentSheet={
                  require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-439-478-Text", [ {
                      templateLiteral: null,
                      prop: "className",
                      target: "style",
                      rawEntries: [ {
                              className: "text-red",
                              declarations: [ {
                                      prop: "color",
                                      value: "rgba(248,113,113,1)"
                                  }
                                  ],
                              selectors: [],
                              precedence: 805306368,
                              important: false,
                              animations: []
                          }
                          ],
                      entries: {
                              base: [ {
                                      className: "text-red",
                                      declarations: [ {
                                              prop: "color",
                                              value: "rgba(248,113,113,1)"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  ],
                              dark: [],
                              pointer: [],
                              group: [],
                              even: [],
                              first: [],
                              last: [],
                              odd: []
                          }
                      ,
                      metadata: {
                              hasAnimations: false,
                              hasGroupEvents: true,
                              hasPointerEvents: true,
                              isGroupParent: true
                          }
                  }
                  ])
              }>Text2</Text>
    </View>
  )
}

const buttonVariants = createVariants({
  base: 'py-5 m-1 rounded-md items-center justify-center',
  variants: {
    variant: {
      primary: 'bg-blue-200',
      secondary: 'bg-white',
    },
    size: {
      large: 'w-40',
      small: 'w-4',
    },
    isDisable: {
      true: 'opacity-30',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});
type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type ButtonProps = ButtonVariantProps & PressableProps;

const Button = (props: ButtonProps) => {
  return (
    <Pressable className={buttonVariants(props)} _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1055-1140-Pressable" _twinComponentTemplateEntries={
              [ {
                  id: "/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1055-1140-Pressable",
                  target: "style",
                  prop: "className",
                  entries: require('@native-twin/core').tw(`${buttonVariants(props)}`),
                  templateLiteral: `${buttonVariants(props)}`,
              }
              ]
          } _twinComponentSheet={
              require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1055-1140-Pressable", [ {
                  templateLiteral: null,
                  prop: "className",
                  target: "style",
                  rawEntries: [],
                  entries: {
                          base: [],
                          dark: [],
                          pointer: [],
                          group: [],
                          even: [],
                          first: [],
                          last: [],
                          odd: []
                      }
                  ,
                  metadata: {
                          hasAnimations: false,
                          hasGroupEvents: false,
                          hasPointerEvents: true,
                          isGroupParent: false
                      }
              }
              ])
          }>
      <Text _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1107-1123-Text" _twinComponentTemplateEntries={
                  []
              } _twinComponentSheet={
                  require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1107-1123-Text", [])
              }>asd</Text>
    </Pressable>
  );
};

function HomeScreen() {
  const [active, setActive] = useState(true);
  return (
    <View className='flex-1 bg-red last:bg-yellow-600' _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1235-2566-View" _twinComponentTemplateEntries={
              []
          } _twinComponentSheet={
              require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1235-2566-View", [ {
                  templateLiteral: null,
                  prop: "className",
                  target: "style",
                  rawEntries: [ {
                          className: "flex-1",
                          declarations: [ {
                                  prop: "flex",
                                  value: "1 1 0%"
                              }
                              ],
                          selectors: [],
                          precedence: 805306368,
                          important: false,
                          animations: []
                      }
                      , {
                          className: "bg-red",
                          declarations: [ {
                                  prop: "backgroundColor",
                                  value: "rgba(248,113,113,1)"
                              }
                              ],
                          selectors: [],
                          precedence: 805306368,
                          important: false,
                          animations: []
                      }
                      , {
                          className: "last:bg-yellow-600",
                          declarations: [ {
                                  prop: "backgroundColor",
                                  value: "rgba(202,138,4,1)"
                              }
                              ],
                          selectors: ["last","&:last"],
                          precedence: 805437440,
                          important: false,
                          animations: []
                      }
                      ],
                  entries: {
                          base: [ {
                                  className: "flex-1",
                                  declarations: [ {
                                          prop: "flex",
                                          value: "1 1 0%"
                                      }
                                      ],
                                  selectors: [],
                                  precedence: 805306368,
                                  important: false,
                                  animations: []
                              }
                              , {
                                  className: "bg-red",
                                  declarations: [ {
                                          prop: "backgroundColor",
                                          value: "rgba(248,113,113,1)"
                                      }
                                      ],
                                  selectors: [],
                                  precedence: 805306368,
                                  important: false,
                                  animations: []
                              }
                              ],
                          dark: [],
                          pointer: [],
                          group: [],
                          even: [],
                          first: [],
                          last: [],
                          odd: []
                      }
                  ,
                  metadata: {
                          hasAnimations: false,
                          hasGroupEvents: true,
                          hasPointerEvents: true,
                          isGroupParent: true
                      }
              }
              ])
          }>
      <View
        className={`
          flex-1
          bg-red-500
          first:bg-purple-600
        `}
        debug _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1293-1679-View" _twinComponentTemplateEntries={
                  []
              } _twinComponentSheet={
                  require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1293-1679-View", [ {
                      templateLiteral: null,
                      prop: "className",
                      target: "style",
                      rawEntries: [ {
                              className: "flex-1",
                              declarations: [ {
                                      prop: "flex",
                                      value: "1 1 0%"
                                  }
                                  ],
                              selectors: [],
                              precedence: 805306368,
                              important: false,
                              animations: []
                          }
                          , {
                              className: "bg-red-500",
                              declarations: [ {
                                      prop: "backgroundColor",
                                      value: "rgba(239,68,68,1)"
                                  }
                                  ],
                              selectors: [],
                              precedence: 805306368,
                              important: false,
                              animations: []
                          }
                          , {
                              className: "first:bg-purple-600",
                              declarations: [ {
                                      prop: "backgroundColor",
                                      value: "rgba(147,51,234,1)"
                                  }
                                  ],
                              selectors: ["first","&:first"],
                              precedence: 805437440,
                              important: false,
                              animations: []
                          }
                          ],
                      entries: {
                              base: [ {
                                      className: "flex-1",
                                      declarations: [ {
                                              prop: "flex",
                                              value: "1 1 0%"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  , {
                                      className: "bg-red-500",
                                      declarations: [ {
                                              prop: "backgroundColor",
                                              value: "rgba(239,68,68,1)"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  , {
                                      className: "last:bg-yellow-600",
                                      declarations: [ {
                                              prop: "backgroundColor",
                                              value: "rgba(202,138,4,1)"
                                          }
                                          ],
                                      selectors: ["last","&:last"],
                                      precedence: 805437440,
                                      important: false,
                                      animations: []
                                  }
                                  ],
                              dark: [],
                              pointer: [],
                              group: [],
                              even: [],
                              first: [],
                              last: [],
                              odd: []
                          }
                      ,
                      metadata: {
                              hasAnimations: false,
                              hasGroupEvents: true,
                              hasPointerEvents: true,
                              isGroupParent: true
                          }
                  }
                  ])
              }
      >
        <View className='p-2 !bg-green-800' _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1429-1665-View" _twinComponentTemplateEntries={
                      []
                  } _twinComponentSheet={
                      require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1429-1665-View", [ {
                          templateLiteral: null,
                          prop: "className",
                          target: "style",
                          rawEntries: [ {
                                  className: "p-2",
                                  declarations: [ {
                                          prop: "padding",
                                          value: "0.5rem"
                                      }
                                      ],
                                  selectors: [],
                                  precedence: 805306368,
                                  important: false,
                                  animations: []
                              }
                              , {
                                  className: "!bg-green-800",
                                  declarations: [ {
                                          prop: "backgroundColor",
                                          value: "rgba(22,101,52,1)"
                                      }
                                      ],
                                  selectors: [],
                                  precedence: 805306368,
                                  important: true,
                                  animations: []
                              }
                              ],
                          entries: {
                                  base: [ {
                                          className: "p-2",
                                          declarations: [ {
                                                  prop: "padding",
                                                  value: "0.5rem"
                                              }
                                              ],
                                          selectors: [],
                                          precedence: 805306368,
                                          important: false,
                                          animations: []
                                      }
                                      , {
                                          className: "!bg-green-800",
                                          declarations: [ {
                                                  prop: "backgroundColor",
                                                  value: "rgba(22,101,52,1)"
                                              }
                                              ],
                                          selectors: [],
                                          precedence: 805306368,
                                          important: true,
                                          animations: []
                                      }
                                      , {
                                          className: "first:bg-purple-600",
                                          declarations: [ {
                                                  prop: "backgroundColor",
                                                  value: "rgba(147,51,234,1)"
                                              }
                                              ],
                                          selectors: ["first","&:first"],
                                          precedence: 805437440,
                                          important: false,
                                          animations: []
                                      }
                                      ],
                                  dark: [],
                                  pointer: [],
                                  group: [],
                                  even: [],
                                  first: [],
                                  last: [],
                                  odd: []
                              }
                          ,
                          metadata: {
                                  hasAnimations: false,
                                  hasGroupEvents: false,
                                  hasPointerEvents: true,
                                  isGroupParent: false
                              }
                      }
                      ])
                  }>
          <Text
            className={`
              text(center xl primary)
              hover:text-gray-700
              `} _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1476-1649-Text" _twinComponentTemplateEntries={
                          []
                      } _twinComponentSheet={
                          require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1476-1649-Text", [ {
                              templateLiteral: null,
                              prop: "className",
                              target: "style",
                              rawEntries: [ {
                                      className: "text-center",
                                      declarations: [ {
                                              prop: "textAlign",
                                              value: "center"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  , {
                                      className: "text-xl",
                                      declarations: [ {
                                              prop: "fontSize",
                                              value: "1.25rem"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  , {
                                      className: "text-primary",
                                      declarations: [ {
                                              prop: "color",
                                              value: "blue"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  , {
                                      className: "hover:text-gray-700",
                                      declarations: [ {
                                              prop: "color",
                                              value: "rgba(55,65,81,1)"
                                          }
                                          ],
                                      selectors: ["hover","&:hover"],
                                      precedence: 805307392,
                                      important: false,
                                      animations: []
                                  }
                                  ],
                              entries: {
                                      base: [ {
                                              className: "text-center",
                                              declarations: [ {
                                                      prop: "textAlign",
                                                      value: "center"
                                                  }
                                                  ],
                                              selectors: [],
                                              precedence: 805306368,
                                              important: false,
                                              animations: []
                                          }
                                          , {
                                              className: "text-xl",
                                              declarations: [ {
                                                      prop: "fontSize",
                                                      value: "1.25rem"
                                                  }
                                                  ],
                                              selectors: [],
                                              precedence: 805306368,
                                              important: false,
                                              animations: []
                                          }
                                          , {
                                              className: "text-primary",
                                              declarations: [ {
                                                      prop: "color",
                                                      value: "blue"
                                                  }
                                                  ],
                                              selectors: [],
                                              precedence: 805306368,
                                              important: false,
                                              animations: []
                                          }
                                          ],
                                      dark: [],
                                      pointer: [ {
                                              className: "hover:text-gray-700",
                                              declarations: [ {
                                                      prop: "color",
                                                      value: "rgba(55,65,81,1)"
                                                  }
                                                  ],
                                              selectors: ["hover","&:hover"],
                                              precedence: 805307392,
                                              important: false,
                                              animations: []
                                          }
                                          ],
                                      group: [],
                                      even: [],
                                      first: [],
                                      last: [],
                                      odd: []
                                  }
                              ,
                              metadata: {
                                      hasAnimations: false,
                                      hasGroupEvents: false,
                                      hasPointerEvents: true,
                                      isGroupParent: false
                                  }
                          }
                          ])
                      }
          >
            Hello World
          </Text>
        </View>
      </View>
      <View
        className={`
          group
          flex-[2]
          !bg-green-800
          bg-gray-500
          hover:bg-pink-600
        `} _twinOrd={1} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1686-2554-View" _twinComponentTemplateEntries={
                  []
              } _twinComponentSheet={
                  require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1686-2554-View", [ {
                      templateLiteral: null,
                      prop: "className",
                      target: "style",
                      rawEntries: [ {
                              className: "group",
                              declarations: [],
                              selectors: [],
                              precedence: 805306368,
                              important: false,
                              animations: []
                          }
                          , {
                              className: "flex-[2]",
                              declarations: [ {
                                      prop: "flex",
                                      value: "2"
                                  }
                                  ],
                              selectors: [],
                              precedence: 805306368,
                              important: false,
                              animations: []
                          }
                          , {
                              className: "bg-gray-500",
                              declarations: [ {
                                      prop: "backgroundColor",
                                      value: "rgba(107,114,128,1)"
                                  }
                                  ],
                              selectors: [],
                              precedence: 805306368,
                              important: false,
                              animations: []
                          }
                          , {
                              className: "!bg-green-800",
                              declarations: [ {
                                      prop: "backgroundColor",
                                      value: "rgba(22,101,52,1)"
                                  }
                                  ],
                              selectors: [],
                              precedence: 805306368,
                              important: true,
                              animations: []
                          }
                          , {
                              className: "hover:bg-pink-600",
                              declarations: [ {
                                      prop: "backgroundColor",
                                      value: "rgba(219,39,119,1)"
                                  }
                                  ],
                              selectors: ["hover","&:hover"],
                              precedence: 805307392,
                              important: false,
                              animations: []
                          }
                          ],
                      entries: {
                              base: [ {
                                      className: "group",
                                      declarations: [],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  , {
                                      className: "flex-[2]",
                                      declarations: [ {
                                              prop: "flex",
                                              value: "2"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  , {
                                      className: "bg-gray-500",
                                      declarations: [ {
                                              prop: "backgroundColor",
                                              value: "rgba(107,114,128,1)"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  , {
                                      className: "!bg-green-800",
                                      declarations: [ {
                                              prop: "backgroundColor",
                                              value: "rgba(22,101,52,1)"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: true,
                                      animations: []
                                  }
                                  ],
                              dark: [],
                              pointer: [ {
                                      className: "hover:bg-pink-600",
                                      declarations: [ {
                                              prop: "backgroundColor",
                                              value: "rgba(219,39,119,1)"
                                          }
                                          ],
                                      selectors: ["hover","&:hover"],
                                      precedence: 805307392,
                                      important: false,
                                      animations: []
                                  }
                                  ],
                              group: [],
                              even: [],
                              first: [],
                              last: [],
                              odd: []
                          }
                      ,
                      metadata: {
                              hasAnimations: false,
                              hasGroupEvents: true,
                              hasPointerEvents: true,
                              isGroupParent: true
                          }
                  }
                  ])
              }
      >
        <Text
          className={`
            text-2xl
            ${active ? 'text-red-800' : 'text-primary'}
          `} _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1849-2021-Text" _twinComponentTemplateEntries={
                      [ {
                          id: "/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1849-2021-Text",
                          target: "style",
                          prop: "className",
                          entries: require('@native-twin/core').tw(`${active ? 'text-red-800' : 'text-primary'}`),
                          templateLiteral: `${active ? 'text-red-800' : 'text-primary'}`,
                      }
                      ]
                  } _twinComponentSheet={
                      require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1849-2021-Text", [ {
                          templateLiteral: null,
                          prop: "className",
                          target: "style",
                          rawEntries: [ {
                                  className: "text-2xl",
                                  declarations: [ {
                                          prop: "fontSize",
                                          value: "1.5rem"
                                      }
                                      ],
                                  selectors: [],
                                  precedence: 805306368,
                                  important: false,
                                  animations: []
                              }
                              ],
                          entries: {
                                  base: [ {
                                          className: "text-2xl",
                                          declarations: [ {
                                                  prop: "fontSize",
                                                  value: "1.5rem"
                                              }
                                              ],
                                          selectors: [],
                                          precedence: 805306368,
                                          important: false,
                                          animations: []
                                      }
                                      ],
                                  dark: [],
                                  pointer: [],
                                  group: [],
                                  even: [],
                                  first: [],
                                  last: [],
                                  odd: []
                              }
                          ,
                          metadata: {
                                  hasAnimations: false,
                                  hasGroupEvents: true,
                                  hasPointerEvents: true,
                                  isGroupParent: true
                              }
                      }
                      ])
                  }
        >
          Nested Hover22222
        </Text>
        <Pressable
          onPressIn={() => {
            setActive((prevState) => !prevState);
          }} _twinOrd={1} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2030-2221-Pressable" _twinComponentTemplateEntries={
                      []
                  } _twinComponentSheet={
                      require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2030-2221-Pressable", [])
                  }
        >
          <Text className='text-gray-200' _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2153-2200-Text" _twinComponentTemplateEntries={
                          []
                      } _twinComponentSheet={
                          require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2153-2200-Text", [ {
                              templateLiteral: null,
                              prop: "className",
                              target: "style",
                              rawEntries: [ {
                                      className: "text-gray-200",
                                      declarations: [ {
                                              prop: "color",
                                              value: "rgba(229,231,235,1)"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  ],
                              entries: {
                                      base: [ {
                                              className: "text-gray-200",
                                              declarations: [ {
                                                      prop: "color",
                                                      value: "rgba(229,231,235,1)"
                                                  }
                                                  ],
                                              selectors: [],
                                              precedence: 805306368,
                                              important: false,
                                              animations: []
                                          }
                                          ],
                                      dark: [],
                                      pointer: [],
                                      group: [],
                                      even: [],
                                      first: [],
                                      last: [],
                                      odd: []
                                  }
                              ,
                              metadata: {
                                      hasAnimations: false,
                                      hasGroupEvents: true,
                                      hasPointerEvents: true,
                                      isGroupParent: true
                                  }
                          }
                          ])
                      }>Activate</Text>
        </Pressable>
        <View
          className={`
            -top-1
            group-hover:bg-pink-800
          `}
          debug _twinOrd={2} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2230-2540-View" _twinComponentTemplateEntries={
                      []
                  } _twinComponentSheet={
                      require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2230-2540-View", [ {
                          templateLiteral: null,
                          prop: "className",
                          target: "style",
                          rawEntries: [ {
                                  className: "-top-1",
                                  declarations: [ {
                                          prop: "top",
                                          value: "-0.25rem"
                                      }
                                      ],
                                  selectors: [],
                                  precedence: 805306368,
                                  important: false,
                                  animations: []
                              }
                              , {
                                  className: "group-hover:bg-pink-800",
                                  declarations: [ {
                                          prop: "backgroundColor",
                                          value: "rgba(157,23,77,1)"
                                      }
                                      ],
                                  selectors: ["group-hover",".group:hover &"],
                                  precedence: 805307392,
                                  important: false,
                                  animations: []
                              }
                              ],
                          entries: {
                                  base: [ {
                                          className: "-top-1",
                                          declarations: [ {
                                                  prop: "top",
                                                  value: "-0.25rem"
                                              }
                                              ],
                                          selectors: [],
                                          precedence: 805306368,
                                          important: false,
                                          animations: []
                                      }
                                      ],
                                  dark: [],
                                  pointer: [],
                                  group: [ {
                                          className: "group-hover:bg-pink-800",
                                          declarations: [ {
                                                  prop: "backgroundColor",
                                                  value: "rgba(157,23,77,1)"
                                              }
                                              ],
                                          selectors: ["group-hover",".group:hover &"],
                                          precedence: 805307392,
                                          important: false,
                                          animations: []
                                      }
                                      ],
                                  even: [],
                                  first: [],
                                  last: [],
                                  odd: []
                              }
                          ,
                          metadata: {
                                  hasAnimations: false,
                                  hasGroupEvents: true,
                                  hasPointerEvents: true,
                                  isGroupParent: true
                              }
                      }
                      ])
                  }
        >
          <Text
            suppressHighlighting
            className='text-gray-800 group-hover:text-white' _twinOrd={0} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2363-2524-Text" _twinComponentTemplateEntries={
                          []
                      } _twinComponentSheet={
                          require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2363-2524-Text", [ {
                              templateLiteral: null,
                              prop: "className",
                              target: "style",
                              rawEntries: [ {
                                      className: "text-gray-800",
                                      declarations: [ {
                                              prop: "color",
                                              value: "rgba(31,41,55,1)"
                                          }
                                          ],
                                      selectors: [],
                                      precedence: 805306368,
                                      important: false,
                                      animations: []
                                  }
                                  , {
                                      className: "group-hover:text-white",
                                      declarations: [ {
                                              prop: "color",
                                              value: "rgba(255,255,255,1)"
                                          }
                                          ],
                                      selectors: ["group-hover",".group:hover &"],
                                      precedence: 805307392,
                                      important: false,
                                      animations: []
                                  }
                                  ],
                              entries: {
                                      base: [ {
                                              className: "text-gray-800",
                                              declarations: [ {
                                                      prop: "color",
                                                      value: "rgba(31,41,55,1)"
                                                  }
                                                  ],
                                              selectors: [],
                                              precedence: 805306368,
                                              important: false,
                                              animations: []
                                          }
                                          ],
                                      dark: [],
                                      pointer: [],
                                      group: [ {
                                              className: "group-hover:text-white",
                                              declarations: [ {
                                                      prop: "color",
                                                      value: "rgba(255,255,255,1)"
                                                  }
                                                  ],
                                              selectors: ["group-hover",".group:hover &"],
                                              precedence: 805307392,
                                              important: false,
                                              animations: []
                                          }
                                          ],
                                      even: [],
                                      first: [],
                                      last: [],
                                      odd: []
                                  }
                              ,
                              metadata: {
                                      hasAnimations: false,
                                      hasGroupEvents: true,
                                      hasPointerEvents: true,
                                      isGroupParent: true
                                  }
                          }
                          ])
                      }
          >
            Deeply nested hover
          </Text>
        </View>
      </View>
    </View>
  );
}

export { HomeScreen };
