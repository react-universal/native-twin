// import { defineConfig, type RuntimeTW, setup } from "@native-twin/core";
// import { presetTailwind } from "@native-twin/preset-tailwind";
// import { renderAsync } from "@testing-library/react-native";
// import { View } from "../bck/components";
// import { createTestRuntimeComponent } from "./test.utils";

// const tw: RuntimeTW = setup(
//   defineConfig({ content: [], presets: [presetTailwind()] })
// );

// describe("Render component", () => {
//   const props = { __twinID: "1", className: "flex-1" } as any;
//   const SimpleView = <View {...props} />;
//   const data = createTestRuntimeComponent("1", "flex-1", tw);

//   test("Render single styled", async () => {
//     const component = await renderAsync(SimpleView);

//     expect(component.root).toHaveProp("styles", data.styles);
//     expect(component.toJSON()).toMatchSnapshot();
//   });
// });
