// @ts-noCheck
import { useState } from 'react';
import { Text, Image, Pressable, View } from 'react-native';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';

const testImage = require('../../assets/favicon.png');

function HomeScreen() {
  const [active, setActive] = useState(true);
  return (
    <View className='flex-1 bg-red' _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/code.tsx-352-2399-View",[

          {
              entries: [{"className":"flex-1","declarations":[{"prop":"flex","value":"1 1 0%"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"bg-red","declarations":[{"prop":"backgroundColor","value":"rgba(248,113,113,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]}],
              metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
              prop: "className",
              target: "style",
              templateLiteral: null,
          }
          ,]
          )} _twinComponentTemplateEntries={[]}
>
      <View
        className={`
          flex-1 items-center justify-center md:border-2
          hover:(web:(bg-blue-600) ios:(bg-green-600) android:(bg-green))
          ios:(p-16 border-black border-2 dark:(bg-blue-500))
          android:(p-14 border-green-200 border-2 bg-gray-800 dark:(bg-purple-500))
          md:(m-10)
          bg-red-500
        `}
        debug isFirstChild={true} ord={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/code.tsx-1153-1879-View",[

              {
                  entries: [{"className":"flex-1","declarations":[{"prop":"flex","value":"1 1 0%"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"items-center","declarations":[{"prop":"alignItems","value":"center"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"justify-center","declarations":[{"prop":"justifyContent","value":"center"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"md:border-2","declarations":[{"prop":"borderWidth","value":"2px"}],"selectors":["768px","@media (min-width:768px)"],"precedence":902299648,"important":false,"animations":[]},{"className":"web:hover:bg-blue-600","declarations":[{"prop":"backgroundColor","value":"rgba(37,99,235,1)"}],"selectors":["web","&:web","hover","&:hover"],"precedence":805438464,"important":false,"animations":[]},{"className":"ios:hover:bg-green-600","declarations":[{"prop":"backgroundColor","value":"rgba(22,163,74,1)"}],"selectors":["ios","&:ios","hover","&:hover"],"precedence":805438464,"important":false,"animations":[]},{"className":"android:hover:bg-green","declarations":[{"prop":"backgroundColor","value":"rgba(74,222,128,1)"}],"selectors":["android","&:android","hover","&:hover"],"precedence":805438464,"important":false,"animations":[]},{"className":"ios:p-16","declarations":[{"prop":"padding","value":"4rem"}],"selectors":["ios","&:ios"],"precedence":805437440,"important":false,"animations":[]},{"className":"ios:border-black","declarations":[{"prop":"borderColor","value":"rgba(0,0,0,1)"}],"selectors":["ios","&:ios"],"precedence":805437440,"important":false,"animations":[]},{"className":"ios:border-2","declarations":[{"prop":"borderWidth","value":"2px"}],"selectors":["ios","&:ios"],"precedence":805437440,"important":false,"animations":[]},{"className":"dark:ios:bg-blue-500","declarations":[{"prop":"backgroundColor","value":"rgba(59,130,246,1)"}],"selectors":["dark","&:dark","ios","&:ios"],"precedence":1879179264,"important":false,"animations":[]},{"className":"android:p-14","declarations":[{"prop":"padding","value":"3.5rem"}],"selectors":["android","&:android"],"precedence":805437440,"important":false,"animations":[]},{"className":"android:border-green-200","declarations":[{"prop":"borderColor","value":"rgba(187,247,208,1)"}],"selectors":["android","&:android"],"precedence":805437440,"important":false,"animations":[]},{"className":"android:border-2","declarations":[{"prop":"borderWidth","value":"2px"}],"selectors":["android","&:android"],"precedence":805437440,"important":false,"animations":[]},{"className":"android:bg-gray-800","declarations":[{"prop":"backgroundColor","value":"rgba(31,41,55,1)"}],"selectors":["android","&:android"],"precedence":805437440,"important":false,"animations":[]},{"className":"dark:android:bg-purple-500","declarations":[{"prop":"backgroundColor","value":"rgba(168,85,247,1)"}],"selectors":["dark","&:dark","android","&:android"],"precedence":1879179264,"important":false,"animations":[]},{"className":"md:m-10","declarations":[{"prop":"margin","value":"2.5rem"}],"selectors":["768px","@media (min-width:768px)"],"precedence":902299648,"important":false,"animations":[]},{"className":"bg-red-500","declarations":[{"prop":"backgroundColor","value":"rgba(239,68,68,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]}],
                  metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":true,"isGroupParent":false},
                  prop: "className",
                  target: "style",
                  templateLiteral: null,
              }
              ,]
              )} _twinComponentTemplateEntries={[]}

      >
        <Button size='large' />
        <View className='bg-white shadow-md rounded-xl p-2' isFirstChild={true} ord={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/code.tsx-5447-5741-View",[

                  {
                      entries: [{"className":"bg-white","declarations":[{"prop":"backgroundColor","value":"rgba(255,255,255,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"shadow-md","declarations":[{"prop":"shadowRadius","value":{"shadowOffset":{"width":0,"height":4},"shadowColor":"rgb(0,0,0)","shadowRadius":6,"shadowOpacity":0.3,"elevation":3}}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"rounded-xl","declarations":[{"prop":"borderRadius","value":"0.75rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"p-2","declarations":[{"prop":"padding","value":"0.5rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]}],
                      metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
                      prop: "className",
                      target: "style",
                      templateLiteral: null,
                  }
                  ,]
                  )} _twinComponentTemplateEntries={[]}
>
          <Text
            className={`
              text(center xl primary)
              font-inter-bold hover:text-gray-700
            `} isFirstChild={true} ord={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/code.tsx-6798-7013-Text",[

                      {
                          entries: [{"className":"text-center","declarations":[{"prop":"textAlign","value":"center"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"text-xl","declarations":[{"prop":"fontSize","value":"1.25rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"text-primary","declarations":[{"prop":"color","value":"blue"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"font-inter-bold","declarations":[{"prop":"fontFamily","value":"Inter-Bold"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"hover:text-gray-700","declarations":[{"prop":"color","value":"rgba(55,65,81,1)"}],"selectors":["hover","&:hover"],"precedence":805307392,"important":false,"animations":[]}],
                          metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":true,"isGroupParent":false},
                          prop: "className",
                          target: "style",
                          templateLiteral: null,
                      }
                      ,]
                      )} _twinComponentTemplateEntries={[]}

          >
            Hello World
          </Text>
        </View>
      </View>
      <View
        className={`
          group
          flex-[2] items-center justify-center
          bg-gray-800 hover:bg-pink-600
        `} ord={1} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/code.tsx-8412-9711-View",[

              {
                  entries: [{"className":"group","declarations":[],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"flex-[2]","declarations":[{"prop":"flex","value":"2"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"items-center","declarations":[{"prop":"alignItems","value":"center"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"justify-center","declarations":[{"prop":"justifyContent","value":"center"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"bg-gray-800","declarations":[{"prop":"backgroundColor","value":"rgba(31,41,55,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"hover:bg-pink-600","declarations":[{"prop":"backgroundColor","value":"rgba(219,39,119,1)"}],"selectors":["hover","&:hover"],"precedence":805307392,"important":false,"animations":[]}],
                  metadata: {"hasAnimations":false,"hasGroupEvents":true,"hasPointerEvents":true,"isGroupParent":true},
                  prop: "className",
                  target: "style",
                  templateLiteral: null,
              }
              ,]
              )} _twinComponentTemplateEntries={[]}

      >
        <Text
          className={`
            font-inter-bold text-2xl capitalize
            ${active ? 'text-red-800' : 'text-primary'}
          `} isFirstChild={true} ord={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/code.tsx-10000-10227-Text",[

                  {
                      entries: [{"className":"font-inter-bold","declarations":[{"prop":"fontFamily","value":"Inter-Bold"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"text-2xl","declarations":[{"prop":"fontSize","value":"1.5rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"capitalize","declarations":[{"prop":"textTransform","value":"capitalize"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]}],
                      metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
                      prop: "className",
                      target: "style",
                      templateLiteral: `${active ? 'text-red-800' : 'text-primary'}`,
                      templateEntries: require('@native-twin/core').tw(`${active ? 'text-red-800' : 'text-primary'}`)
                  }
                  ,]
                  )} _twinComponentTemplateEntries={[ {
                      entries: require('@native-twin/core').tw(`${active ? 'text-red-800' : 'text-primary'}`),
                      id: "/fixtures/code.tsx-10000-10227-Text",
                      target: "style",
                      prop: "className",
                  }
                  ,]}

        >
          Nested Hover22222
        </Text>
        <Pressable
          onPressIn={() => {
            setActive((prevState) => !prevState);
          }} ord={1} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/code.tsx-11693-11902-Pressable",[

                  ]
                  )} _twinComponentTemplateEntries={[]}

        >
          <Text className='text-gray-200  text-3xl' isFirstChild={true} ord={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/code.tsx-12025-12110-Text",[

                      {
                          entries: [{"className":"text-gray-200","declarations":[{"prop":"color","value":"rgba(229,231,235,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"text-3xl","declarations":[{"prop":"fontSize","value":"1.875rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]}],
                          metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
                          prop: "className",
                          target: "style",
                          templateLiteral: null,
                      }
                      ,]
                      )} _twinComponentTemplateEntries={[]}
>Activate</Text>
        </Pressable>
        <Image
          source={testImage}
          resizeMode='contain'
          resizeMethod='resize'
          className='-translate-x-[10vw] rounded-full border-1 w-5 h-5'
          style={{
            width: 100,
            height: 100,
          }} ord={2} isLastChild={true} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/code.tsx-13018-13307-Image",[

                  {
                      entries: [{"className":"-translate-x-[10vw]","declarations":[{"prop":"transform","value":[{"prop":"translateX","value":"-10vw"}]}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"rounded-full","declarations":[{"prop":"borderRadius","value":"9999px"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"border-1","declarations":[{"prop":"borderWidth","value":"1px"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"w-5","declarations":[{"prop":"width","value":"1.25rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"h-5","declarations":[{"prop":"height","value":"1.25rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]}],
                      metadata: {"hasAnimations":false,"hasGroupEvents":false,"hasPointerEvents":false,"isGroupParent":false},
                      prop: "className",
                      target: "style",
                      templateLiteral: null,
                  }
                  ,]
                  )} _twinComponentTemplateEntries={[]}

        />
        <TextField />
        <View
          className={`
            -top-1 -translate-x-2
            mb-2 rounded-lg bg-gray-300 p-2
            group-hover:bg-pink-800
          `}
          debug ord={3} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/code.tsx-14655-15072-View",[

                  {
                      entries: [{"className":"-top-1","declarations":[{"prop":"top","value":"-0.25rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"-translate-x-2","declarations":[{"prop":"transform","value":[{"prop":"translateX","value":"-0.5rem"}]}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"mb-2","declarations":[{"prop":"marginBottom","value":"0.5rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"rounded-lg","declarations":[{"prop":"borderRadius","value":"0.5rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"bg-gray-300","declarations":[{"prop":"backgroundColor","value":"rgba(209,213,219,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"p-2","declarations":[{"prop":"padding","value":"0.5rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"group-hover:bg-pink-800","declarations":[{"prop":"backgroundColor","value":"rgba(157,23,77,1)"}],"selectors":["group-hover",".group:hover &"],"precedence":805307392,"important":false,"animations":[]}],
                      metadata: {"hasAnimations":false,"hasGroupEvents":true,"hasPointerEvents":false,"isGroupParent":false},
                      prop: "className",
                      target: "style",
                      templateLiteral: null,
                  }
                  ,]
                  )} _twinComponentTemplateEntries={[]}

        >
          <Text
            suppressHighlighting
            className='font-inter-bold rotate-6 text-2xl text-gray-800 group-hover:text-white -mt-2' isFirstChild={true} ord={0} _twinComponentSheet={require('@native-twin/jsx').StyleSheet.registerComponent("/fixtures/code.tsx-16555-16784-Text",[

                      {
                          entries: [{"className":"font-inter-bold","declarations":[{"prop":"fontFamily","value":"Inter-Bold"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"rotate-6","declarations":[{"prop":"transform","value":[{"prop":"rotate","value":"6deg"}]}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"text-2xl","declarations":[{"prop":"fontSize","value":"1.5rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"text-gray-800","declarations":[{"prop":"color","value":"rgba(31,41,55,1)"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]},{"className":"group-hover:text-white","declarations":[{"prop":"color","value":"rgba(255,255,255,1)"}],"selectors":["group-hover",".group:hover &"],"precedence":805307392,"important":false,"animations":[]},{"className":"-mt-2","declarations":[{"prop":"marginTop","value":"-0.5rem"}],"selectors":[],"precedence":805306368,"important":false,"animations":[]}],
                          metadata: {"hasAnimations":false,"hasGroupEvents":true,"hasPointerEvents":false,"isGroupParent":false},
                          prop: "className",
                          target: "style",
                          templateLiteral: null,
                      }
                      ,]
                      )} _twinComponentTemplateEntries={[]}

          >
            Deeply nested hover
          </Text>
        </View>
      </View>
    </View>
  );
}

export { HomeScreen };
