// @ts-noCheck
import { useState } from 'react';
import { Text, View } from 'react-native';
import 'globals.css';
import { StyleSheet as _Twin___StyleSheet } from "@native-twin/jsx/sheet";
const Button = () => {
  return <View _twinInjected={{
    id: "#e8bfnd",
    index: -1,
    parentID: "null",
    parentSize: -1,
    metadata: {
      isGroupParent: false,
      hasGroupEvents: false,
      hasPointerEvents: true
    },
    templateEntries: []
  }} _twinElementID={"#e8bfnd"} _twinElementOrder={-1}>
      <Text _twinInjected={{
      id: "#1hv7jxv",
      index: 0,
      parentID: "#e8bfnd",
      parentSize: 3,
      metadata: {
        isGroupParent: false,
        hasGroupEvents: false,
        hasPointerEvents: false
      },
      templateEntries: []
    }} _twinElementID={"#1hv7jxv"} _twinElementParentID={"#e8bfnd"} _twinElementOrder={0}>Text1</Text>
      <Text _twinInjected={{
      id: "#1pcytdw",
      index: 1,
      parentID: "#e8bfnd",
      parentSize: 3,
      metadata: {
        isGroupParent: false,
        hasGroupEvents: false,
        hasPointerEvents: false
      },
      templateEntries: [{
        prop: "className",
        target: "style",
        value: `${true ? 'text-medium' : 'text-bold'}`
      }]
    }} _twinElementID={"#1pcytdw"} _twinElementParentID={"#e8bfnd"} _twinElementOrder={1}>Text3</Text>
      <View _twinInjected={{
      id: "#7rx9mp",
      index: 2,
      parentID: "#e8bfnd",
      parentSize: 3,
      metadata: {
        isGroupParent: false,
        hasGroupEvents: false,
        hasPointerEvents: false
      },
      templateEntries: []
    }} _twinElementID={"#7rx9mp"} _twinElementParentID={"#e8bfnd"} _twinElementOrder={2}>
        <Span _twinInjected={{
        id: "#1xvgwoc",
        index: 0,
        parentID: "#7rx9mp",
        parentSize: 1,
        metadata: {
          isGroupParent: false,
          hasGroupEvents: false,
          hasPointerEvents: false
        },
        templateEntries: []
      }} _twinElementID={"#1xvgwoc"} _twinElementParentID={"#7rx9mp"} _twinElementOrder={0}>Hallo</Span>
      </View>
    </View>;
};
const AnyOther = () => <View _twinInjected={{
  id: "#1fmu02a",
  index: -1,
  parentID: "null",
  parentSize: -1,
  metadata: {
    isGroupParent: false,
    hasGroupEvents: false,
    hasPointerEvents: false
  },
  templateEntries: []
}} _twinElementID={"#1fmu02a"} _twinElementOrder={-1}>
    <Text _twinInjected={{
    id: "#1g7tm4h",
    index: 0,
    parentID: "#1fmu02a",
    parentSize: 1,
    metadata: {
      isGroupParent: false,
      hasGroupEvents: false,
      hasPointerEvents: false
    },
    templateEntries: []
  }} _twinElementID={"#1g7tm4h"} _twinElementParentID={"#1fmu02a"} _twinElementOrder={0}>asd</Text>
  </View>;
export { ChildProp };
__Twin___StyleSheet.inject([{
  id: "#e8bfnd",
  index: -1,
  parentID: "null",
  parentSize: -1,
  metadata: {
    isGroupParent: false,
    hasGroupEvents: false,
    hasPointerEvents: true
  },
  props: [{
    target: "style",
    prop: "className",
    entries: [{
      className: "bg-[#000]",
      declarations: [{
        _tag: "COMPILED",
        prop: "backgroundColor",
        value: "rgba(0,0,0,1)"
      }],
      group: "base",
      important: false,
      inherited: false,
      precedence: 805306368
    }, {
      className: "hover:bg-red",
      declarations: [{
        _tag: "COMPILED",
        prop: "backgroundColor",
        value: "rgba(248,113,113,1)"
      }],
      group: "pointer",
      important: false,
      inherited: false,
      precedence: 805307392
    }]
  }],
  childStyles: [{
    className: "last:hover:text-[20vw]",
    declarations: [{
      _tag: "COMPILED",
      prop: "fontSize",
      value: "20vw"
    }],
    group: "last",
    important: false,
    inherited: false,
    precedence: 805438464
  }, {
    className: "odd:text-[10px]",
    declarations: [{
      _tag: "COMPILED",
      prop: "fontSize",
      value: 10
    }],
    group: "odd",
    important: false,
    inherited: false,
    precedence: 805437440
  }, {
    className: "even:text-[30px]",
    declarations: [{
      _tag: "COMPILED",
      prop: "fontSize",
      value: 30
    }],
    group: "even",
    important: false,
    inherited: false,
    precedence: 805437440
  }]
}, {
  id: "#1hv7jxv",
  index: 0,
  parentID: "#e8bfnd",
  parentSize: 3,
  metadata: {
    isGroupParent: false,
    hasGroupEvents: false,
    hasPointerEvents: false
  },
  props: [{
    target: "style",
    prop: "className",
    entries: [{
      className: "font-medium",
      declarations: [{
        _tag: "COMPILED",
        prop: "fontWeight",
        value: 500
      }],
      group: "base",
      important: false,
      inherited: false,
      precedence: 805306368
    }, {
      className: "odd:text-[10px]",
      declarations: [{
        _tag: "COMPILED",
        prop: "fontSize",
        value: 10
      }],
      group: "base",
      important: false,
      inherited: true,
      precedence: 805437440
    }]
  }],
  childStyles: []
}, {
  id: "#1pcytdw",
  index: 1,
  parentID: "#e8bfnd",
  parentSize: 3,
  metadata: {
    isGroupParent: false,
    hasGroupEvents: false,
    hasPointerEvents: false
  },
  props: [{
    target: "style",
    prop: "className",
    entries: [{
      className: "even:text-[30px]",
      declarations: [{
        _tag: "COMPILED",
        prop: "fontSize",
        value: 30
      }],
      group: "base",
      important: false,
      inherited: true,
      precedence: 805437440
    }]
  }],
  childStyles: []
}, {
  id: "#7rx9mp",
  index: 2,
  parentID: "#e8bfnd",
  parentSize: 3,
  metadata: {
    isGroupParent: false,
    hasGroupEvents: false,
    hasPointerEvents: false
  },
  props: [{
    target: "style",
    prop: "className",
    entries: [{
      className: "last:hover:text-[20vw]",
      declarations: [{
        _tag: "COMPILED",
        prop: "fontSize",
        value: "20vw"
      }],
      group: "base",
      important: false,
      inherited: true,
      precedence: 805438464
    }, {
      className: "odd:text-[10px]",
      declarations: [{
        _tag: "COMPILED",
        prop: "fontSize",
        value: 10
      }],
      group: "base",
      important: false,
      inherited: true,
      precedence: 805437440
    }]
  }],
  childStyles: []
}, {
  id: "#1xvgwoc",
  index: 0,
  parentID: "#7rx9mp",
  parentSize: 1,
  metadata: {
    isGroupParent: false,
    hasGroupEvents: false,
    hasPointerEvents: false
  },
  props: [],
  childStyles: []
}, {
  id: "#1fmu02a",
  index: -1,
  parentID: "null",
  parentSize: -1,
  metadata: {
    isGroupParent: false,
    hasGroupEvents: false,
    hasPointerEvents: false
  },
  props: [{
    target: "style",
    prop: "className",
    entries: [{
      className: "flex-1",
      declarations: [{
        _tag: "COMPILED",
        prop: "flex",
        value: {
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: "0%"
        }
      }],
      group: "base",
      important: false,
      inherited: false,
      precedence: 805306368
    }]
  }],
  childStyles: []
}, {
  id: "#1g7tm4h",
  index: 0,
  parentID: "#1fmu02a",
  parentSize: 1,
  metadata: {
    isGroupParent: false,
    hasGroupEvents: false,
    hasPointerEvents: false
  },
  props: [{
    target: "style",
    prop: "className",
    entries: [{
      className: "flex-1",
      declarations: [{
        _tag: "COMPILED",
        prop: "flex",
        value: {
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: "0%"
        }
      }],
      group: "base",
      important: false,
      inherited: false,
      precedence: 805306368
    }]
  }],
  childStyles: []
}]);