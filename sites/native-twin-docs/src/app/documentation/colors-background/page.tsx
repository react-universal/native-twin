import { HeaderDocsTop } from "@/feactures/docs/layout/HeaderDocsTop";
import tailwindClasses from "../../../../data";
import { ClassToRenderer } from "@/feactures/docs/layout/ClassToRederer";
import { dataBackground, dataShadowAndIndex } from "./dataColors";

export default function ColorsBackgroundPage() {
  return (
    <div className="flex flex-col gap-5">
      <HeaderDocsTop
        title="Background and Border"
        Data={tailwindClasses.colorsBackground.background}
        id="background"
      ></HeaderDocsTop>
      <ClassToRenderer list={dataBackground}/>
      <HeaderDocsTop
        title="Shadows and Z-index"
        id="shadowZIndex"
        Data={tailwindClasses.colorsBackground.shadowZIndex}
      ></HeaderDocsTop>
      <ClassToRenderer list={dataShadowAndIndex}/>

    </div>
  );
}
