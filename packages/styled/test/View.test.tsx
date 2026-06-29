import { defineConfig, setup } from "@native-twin/core";
import { isObject, stableHash } from "@native-twin/helpers";
import { presetTailwind } from "@native-twin/preset-tailwind";
import { render as tlRender } from "@testing-library/react-native";
import { createElement } from "react";
import { View } from "../src/components/View";
import { createTestRuntimeComponent } from "./test.utils";

beforeAll(() => {
  setup(defineConfig({ content: [], presets: [presetTailwind()] }));
});

let nn = 1;
const createComponentProps = (classNames: string) =>
  stableHash({ classNames, id: nn++ });

describe("@native-twin/styled", () => {
  it("StyledView render", () => {
    const childProps = createTestRuntimeComponent("_Child:0:1", "bg-red");
    const parentProps = createTestRuntimeComponent(
      "_Parent:0",
      "flex-1 first:(border-2)",
      [childProps]
    );

    const sss = tlRender(<View className="asdad" />, {
      createNodeMock(element) {
        console.log("sadasd");
        return createElement(
          element.type,
          isObject(element.props)
            ? { ...element.props, asdasd: "asdasdasd" }
            : element.props
        );
      },
      concurrentRoot: false,
    });
    // sss.rerender(sss.root.instance);
    sss.debug({ compact: false, mapProps: (props) => props });
    const component = tlRender(
      <View {...parentProps}>
        <View {...childProps} />
      </View>
    );
    const tree = component.toJSON();
    expect(sss.toJSON()).toMatchSnapshot();
    expect(tree).toMatchSnapshot();
  });
  // it("CustomView render", () => {
  //   const component = tlRender(
  //     <View className="shadow-sm web:p-10 sm:p-10 flex-1 outline-none">
  //       <Text className="leading-6">asd</Text>
  //     </View>,
  //     {}
  //   );
  //   const tree = component.toJSON();
  //   expect(tree).toMatchSnapshot();
  // });
});
