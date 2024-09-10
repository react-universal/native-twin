// import { ButtonContent } from "@/components/contentDoc/ButtonContent";
// import {
//   ButtonProps,
//   ContentType,
//   ContentTypeMap,
//   ImageProps,
//   ParagraphProps,
//   SubtitleProps,
//   TextProps,
//   TitleProps,
// } from "../../data";
// import { ImageContent } from "@/components/contentDoc/ImageContent";
// import { ParagraphContent } from "@/components/contentDoc/ParagraphContent";
// import { SubtitleContent } from "@/components/contentDoc/SubtitleContent";
// import { TitleContent } from "@/components/contentDoc/TitleContent";
// import { TextContent } from "@/components/contentDoc/TextContent";

// export type PropsMap = {
//   [ContentTypeMap.Button]: ButtonProps;
//   [ContentTypeMap.Image]: ImageProps;
//   [ContentTypeMap.Paragraph]: ParagraphProps;
//   [ContentTypeMap.Subtitle]: SubtitleProps;
//   [ContentTypeMap.Text]: TextProps;
//   [ContentTypeMap.Title]: TitleProps;
// };

// export const ElementsToRender = {
//   [ContentTypeMap.Button]: (props: ButtonProps, key: string | number) => (
//     <ButtonContent key={key} props={props}></ButtonContent>
//   ),
//   [ContentTypeMap.Image]: (props: ImageProps, key: string | number) => (
//     <ImageContent key={key} props={props}></ImageContent>
//   ),
//   [ContentTypeMap.Paragraph]: (props: ParagraphProps, key: string | number) => (
//     <ParagraphContent key={key} props={props}></ParagraphContent>
//   ),
//   [ContentTypeMap.Subtitle]: (props: SubtitleProps, key: string | number) => (
//     <SubtitleContent key={key} props={props}></SubtitleContent>
//   ),
//   [ContentTypeMap.Text]: (props: TextProps, key: string | number) => (
//     <TextContent key={key} props={props}></TextContent>
//   ),
//   [ContentTypeMap.Title]: (props: TitleProps, key: string | number) => (
//     <TitleContent key={key} props={props}></TitleContent>
//   ),
// };

// // Definir el tipo de los componentes en ElementsToRender
// type ComponentType = (props: any, key: string | number) => JSX.Element;

// // matchComponents busca el componente correspondiente
// export function matchComponents(type: ContentType): ComponentType | null {
//   const Component = ElementsToRender[type];
//   return Component || null;
// }

// // renderComponents usa el componente devuelto por matchComponents
// export function renderComponents(
//   type: ContentType,
//   propsElement: any,
//   index: number | string
// ) {
//   const Component = matchComponents(type);

//   // Verificar si Component es null
//   if (Component) {
//     return Component(propsElement, index);
//   }

//   return null; // O cualquier valor predeterminado si no hay componente
// }
