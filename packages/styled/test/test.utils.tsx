import { parseTWTokens } from "@native-twin/css";
import type { TwinRuntimeComponent } from "@native-twin/css/jsx";
import { StyleSheet } from "../src/native/StyleSheet";

export function createTestRuntimeComponent(
  id: string,
  classNames: string,
  childProps: Record<string, any>[] = [],
  parentID: string = "NONE"
) {
  const tokens = parseTWTokens(classNames);
  const compiledEntries = tokens.map((x) => StyleSheet.compileParsedRule(x));

  // const finalStyles = composeDeclarations(
  //   compiledEntries.flatMap((x) => x.decls),
  //   StyleSheet.runtimeContext,
  // );
  const metadata = {
    hasGroupEvents: compiledEntries.some((x) => x.isGroupSelector),
    hasPointerEvents: compiledEntries.some((x) => x.isPointerEntry),
    isGroupParent: compiledEntries.some((x) => x.isGroupParent),
  };
  const component: TwinRuntimeComponent = {
    id,
    index: 0,
    childStyles: compiledEntries
      .filter((x) => x.isChildEntry)
      .map((c) => c.toRuntime(false)),
    metadata,
    parentID: parentID,
    parentSize: 0,
    childIds: childProps.map((x) => x["__twinID"]),
    props: [
      {
        entries: {
          base: compiledEntries
            .filter((x) => x.isBaseEntry)
            .map((x) => x.toRuntime(false)),
          child: compiledEntries
            .filter((x) => x.isChildEntry)
            .map((x) => x.toRuntime(false)),
          group: compiledEntries
            .filter((x) => x.isGroupSelector)
            .map((x) => x.toRuntime(false)),
          pointer: compiledEntries
            .filter((x) => x.isPointerEntry)
            .map((x) => x.toRuntime(false)),
        },
        classNames: classNames,
        templateEntries: classNames,
        metadata,
        prop: "className",
        target: "styles",
      },
    ],
  };
  // console.log(inspect(component, false, null, true));
  StyleSheet.registerComponent(component);
  return { __twinID: id, classNames, __parentID: parentID };
}
