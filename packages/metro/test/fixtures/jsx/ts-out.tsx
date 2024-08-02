// @ts-noCheck
import { useState } from 'react';
import { Text, Image, Pressable, View, PressableProps } from 'react-native';
import { VariantProps, createVariants } from '@native-twin/styled';
import { TextField } from '../components/TextField';

const testImage = require('../../assets/favicon.png');

const ChildProp = () => {
  return (
    <View className='bg-black last:text-lg' _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-345-490-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-345-490-AnyTag",[

          {
              entries: [{"className":"bg-black","declarations":[{"prop":"backgroundColor","value":"rgba(0,0,0,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"last:text-lg","declarations":[{"prop":"fontSize","value":"1.125rem"}],"selectors":["last","&:last"],"precedence":805437440,"important":false,"animations":[]}],
              metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
              prop: "className",
              target: "style",
              templateLiteral: null,
          }
          ,]
          )}
>
      <Text className='text-blue' _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-392-432-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-392-432-AnyTag",[

              {
                  entries: [{"className":"text-blue","declarations":[{"prop":"color","value":"rgba(96,165,250,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]}],
                  metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
                  prop: "className",
                  target: "style",
                  templateLiteral: null,
              }
              ,]
              )}
>Text1</Text>
      <Text className='text-red' _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-439-478-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-439-478-AnyTag",[

              {
                  entries: [{"className":"text-red","declarations":[{"prop":"color","value":"rgba(248,113,113,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]}],
                  metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
                  prop: "className",
                  target: "style",
                  templateLiteral: null,
              }
              ,]
              )}
>Text2</Text>
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
    <Pressable className={buttonVariants(props)} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1055-1140-AnyTag" _twinComponentTemplateEntries={[ {
              entries: require('@native-twin/core').tw(`${buttonVariants(props)}`),
              id: "/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1055-1140-AnyTag",
              target: "style",
              prop: "className",
          }
          ,]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1055-1140-AnyTag",[

          {
              entries: [],
              metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
              prop: "className",
              target: "style",
              templateLiteral: `${buttonVariants(props)}`,
              templateEntries: require('@native-twin/core').tw(`${buttonVariants(props)}`)
          }
          ,]
          )}
>
      <Text _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1107-1123-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1107-1123-AnyTag",[

              ]
              )}
>asd</Text>
    </Pressable>
  );
};

function HomeScreen() {
  const [active, setActive] = useState(true);
  return (
    <View className='flex-1 bg-red last:bg-yellow-600' _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1235-2566-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1235-2566-AnyTag",[

          {
              entries: [{"className":"bg-red","declarations":[{"prop":"backgroundColor","value":"rgba(248,113,113,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"flex-1","declarations":[{"prop":"flex","value":"1 1 0%"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"last:bg-yellow-600","declarations":[{"prop":"backgroundColor","value":"rgba(202,138,4,1)"}],"selectors":["last","&:last"],"precedence":805437440,"important":false,"animations":[]}],
              metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
              prop: "className",
              target: "style",
              templateLiteral: null,
          }
          ,]
          )}
>
      <View
        className={`
          flex-1
          bg-red-500
          first:bg-purple-600
        `}
        debug _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1293-1679-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1293-1679-AnyTag",[

              {
                  entries: [{"className":"bg-red-500","declarations":[{"prop":"backgroundColor","value":"rgba(239,68,68,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"flex-1","declarations":[{"prop":"flex","value":"1 1 0%"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"first:bg-purple-600","declarations":[{"prop":"backgroundColor","value":"rgba(147,51,234,1)"}],"selectors":["first","&:first"],"precedence":805437440,"important":false,"animations":[]}],
                  metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
                  prop: "className",
                  target: "style",
                  templateLiteral: null,
              }
              ,]
              )}

      >
        <View className='p-2 !bg-green-800' _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1429-1665-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1429-1665-AnyTag",[

                  {
                      entries: [{"className":"p-2","declarations":[{"prop":"padding","value":"0.5rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"!bg-green-800","declarations":[{"prop":"backgroundColor","value":"rgba(22,101,52,1)"}],"selectors":[],"precedence":805306368,"important":true,"animations":[]}],
                      metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
                      prop: "className",
                      target: "style",
                      templateLiteral: null,
                  }
                  ,]
                  )}
>
          <Text
            className={`
              text(center xl primary)
              hover:text-gray-700
              `} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1476-1649-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1476-1649-AnyTag",[

                      {
                          entries: [{"className":"text-primary","declarations":[{"prop":"color","value":"blue"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"text-xl","declarations":[{"prop":"fontSize","value":"1.25rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"text-center","declarations":[{"prop":"textAlign","value":"center"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"hover:text-gray-700","declarations":[{"prop":"color","value":"rgba(55,65,81,1)"}],"selectors":["hover","&:hover"],"precedence":805307392,"important":false,"animations":[]}],
                          metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":true,"isGroupParent":false},
                          prop: "className",
                          target: "style",
                          templateLiteral: null,
                      }
                      ,]
                      )}

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
        `} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1686-2554-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1686-2554-AnyTag",[

              {
                  entries: [{"className":"bg-gray-500","declarations":[{"prop":"backgroundColor","value":"rgba(107,114,128,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"flex-[2]","declarations":[{"prop":"flex","value":"2"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"group","declarations":[],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"!bg-green-800","declarations":[{"prop":"backgroundColor","value":"rgba(22,101,52,1)"}],"selectors":[],"precedence":805306368,"important":true,"animations":[]},{"className":"hover:bg-pink-600","declarations":[{"prop":"backgroundColor","value":"rgba(219,39,119,1)"}],"selectors":["hover","&:hover"],"precedence":805307392,"important":false,"animations":[]}],
                  metadata: {"hasAnimations":false,"hasGroupEvents":true,"hasPointerEvents":true,"isGroupParent":true},
                  prop: "className",
                  target: "style",
                  templateLiteral: null,
              }
              ,]
              )}

      >
        <Text
          className={`
            text-2xl
            ${active ? 'text-red-800' : 'text-primary'}
          `} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1849-2021-AnyTag" _twinComponentTemplateEntries={[ {
                      entries: require('@native-twin/core').tw(`${active ? 'text-red-800' : 'text-primary'}`),
                      id: "/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1849-2021-AnyTag",
                      target: "style",
                      prop: "className",
                  }
                  ,]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-1849-2021-AnyTag",[

                  {
                      entries: [{"className":"text-2xl","declarations":[{"prop":"fontSize","value":"1.5rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]}],
                      metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
                      prop: "className",
                      target: "style",
                      templateLiteral: `${active ? 'text-red-800' : 'text-primary'}`,
                      templateEntries: require('@native-twin/core').tw(`${active ? 'text-red-800' : 'text-primary'}`)
                  }
                  ,]
                  )}

        >
          Nested Hover22222
        </Text>
        <Pressable
          onPressIn={() => {
            setActive((prevState) => !prevState);
          }} _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2030-2221-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2030-2221-AnyTag",[

                  ]
                  )}

        >
          <Text className='text-gray-200' _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2153-2200-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2153-2200-AnyTag",[

                      {
                          entries: [{"className":"text-gray-200","declarations":[{"prop":"color","value":"rgba(229,231,235,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]}],
                          metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
                          prop: "className",
                          target: "style",
                          templateLiteral: null,
                      }
                      ,]
                      )}
>Activate</Text>
        </Pressable>
        <View
          className={`
            -top-1
            group-hover:bg-pink-800
          `}
          debug _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2230-2540-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2230-2540-AnyTag",[

                  {
                      entries: [{"className":"-top-1","declarations":[{"prop":"top","value":"-0.25rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"group-hover:bg-pink-800","declarations":[{"prop":"backgroundColor","value":"rgba(157,23,77,1)"}],"selectors":["group-hover",".group:hover &"],"precedence":805307392,"important":false,"animations":[]}],
                      metadata: {"hasAnimations":false,"hasGroupEvents":true,"hasPointerEvents":false,"isGroupParent":false},
                      prop: "className",
                      target: "style",
                      templateLiteral: null,
                  }
                  ,]
                  )}

        >
          <Text
            suppressHighlighting
            className='text-gray-800 group-hover:text-white' _twinComponentID="/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2363-2524-AnyTag" _twinComponentTemplateEntries={[]} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/Users/christiangutierrez/work/native-twin/packages/metro/test/fixtures/jsx/code.tsx-2363-2524-AnyTag",[

                      {
                          entries: [{"className":"text-gray-800","declarations":[{"prop":"color","value":"rgba(31,41,55,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"group-hover:text-white","declarations":[{"prop":"color","value":"rgba(255,255,255,1)"}],"selectors":["group-hover",".group:hover &"],"precedence":805307392,"important":false,"animations":[]}],
                          metadata: {"hasAnimations":false,"hasGroupEvents":true,"hasPointerEvents":false,"isGroupParent":false},
                          prop: "className",
                          target: "style",
                          templateLiteral: null,
                      }
                      ,]
                      )}

          >
            Deeply nested hover
          </Text>
        </View>
      </View>
    </View>
  );
}

export { HomeScreen };
