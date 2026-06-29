// import { defineConfig, setup } from "@native-twin/core";
// import { presetTailwind } from "@native-twin/preset-tailwind";
// import { render } from "@testing-library/react-native";
// import {
//   ScrollView as RNScrollView,
//   Text as RNText,
//   View as RNView,
// } from "react-native";
// import { createStyled } from "../bck";
// import { createVariants } from "../bck/styled/variants";

// const ScrollView = createStyled(RNScrollView, {
//   className: {
//     target: "contentContainerStyle",
//   },
// });
// const View = createStyled(RNView, { className: "style" });

// beforeAll(() => {
//   setup(defineConfig({ content: [], presets: [presetTailwind()] }));
// });

// // function toJson(component: renderer.ReactTestRenderer) {
// //   const result = component.toJSON();
// //   expect(result).toBeDefined();
// //   expect(result).not.toBeInstanceOf(Array);
// //   return result as renderer.ReactTestRendererJSON;
// // }

// describe("@native-twin/styled", () => {
//   it("ScrollView render", () => {
//     const component = render(
//       <ScrollView className="flex-1">
//         <View />
//       </ScrollView>
//     );
//     const tree = component.toJSON();
//     expect(tree).toMatchSnapshot();
//   });
// });

// const viewVariants = createVariants({
//   base: `
//     flex-1
//     hover:(bg-blue-600)
//     p-14 bg-rose-200 border-white border-2
//     items-center justify-center md:border-3
//   `,
//   variants: {
//     intent: {
//       primary: "",
//       secondary: "m-2",
//       third: "",
//     },
//     active: {
//       true: "",
//       false: "",
//     },
//   },
//   defaultVariants: {
//     active: true,
//   },
// });
// const H1 = createStyled(RNText, { className: "style" });

// describe("@native-twin/styled", () => {
//   it("Complex View", () => {
//     const className = viewVariants({ intent: "secondary" });
//     const component = render(
//       <View className={className}>
//         <H1 className="text(center 2xl indigo-600) hover:text-gray-700">
//           H1 - 1
//         </H1>
//       </View>
//     );
//     const tree = component.toJSON();
//     expect(tree).toMatchSnapshot();
//   });
// });

// // NOT WORKING
// // describe('@native-twin/styled', () => {
// //   it('FlatList', () => {
// //     const className = viewVariants({ intent: 'secondary' });
// //     const component = renderer.create(
// //       <FlatList
// //         data={[{ key: 'i1' }, { key: 'i2' }]}
// //         renderItem={(props) => (
// //           <H1 className='text(center 2xl indigo-600) hover:text-gray-700'>{props.item.key}</H1>
// //         )}
// //         className={className}
// //         keyExtractor={(i) => i.key}
// //       />,
// //     );
// //     let tree = toJson(component);
// //     expect(tree).toMatchSnapshot();
// //   });
// // });
