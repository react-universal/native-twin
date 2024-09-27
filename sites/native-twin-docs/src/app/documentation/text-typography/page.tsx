import { HeaderDocsTop } from "@/feactures/docs/layout/HeaderDocsTop";
import tailwindClasses from "../../../../data";
import { ClassToRenderer } from "@/feactures/docs/layout/ClassToRederer";
import { dataDecoration, dataText } from "./dataText";

export default function TextTypographyPage() {
  return (
    <div className="flex flex-col gap-5">
      <HeaderDocsTop
        title="Text Styles"
        id="textStyles"
        Data={tailwindClasses.textTypography.textStyles}
      ></HeaderDocsTop>
      <ClassToRenderer list={dataText}/>
      <HeaderDocsTop
        title="Decoration And Color"
        id="decorationAndColor"
        Data={tailwindClasses.textTypography.decorationAndColor}
      ></HeaderDocsTop>
      <ClassToRenderer list={dataDecoration}/>

    </div>
  );
}
