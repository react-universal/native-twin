import { HeaderDocsTop } from "@/feactures/docs/layout/HeaderDocsTop";
import tailwindClasses from "../../../../data";
import { ClassToRenderer } from "@/feactures/docs/layout/ClassToRederer";
import { dataTransform } from "./dataTransform";

export default function TransformationsPage() {
  return (
    <div className="flex flex-col gap-5">
      <HeaderDocsTop
        id="transform"
        title="Transform"
        Data={tailwindClasses.transformations.transform}
      ></HeaderDocsTop>
      <ClassToRenderer list={dataTransform}/>
    </div>
  );
}
