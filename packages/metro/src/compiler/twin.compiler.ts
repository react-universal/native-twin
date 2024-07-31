import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { Project, SyntaxKind } from 'ts-morph';
import { inspect } from 'util';
import type { RuntimeTW } from '@native-twin/core';
import type { RuntimeComponentEntry, SheetGroupEntries } from '../sheet/sheet.types';
import { excludeChildEntries, mergeChildEntries } from '../sheet/utils/styles.utils';
import * as compilerMaps from './twin.maps';
import type { ResultComponent } from './twin.types';
import * as tsUtils from './utils/ts.utils';

const project = new Project({
  useInMemoryFileSystem: true,
});

export interface SheetRegistry {
  id: string;
  parentID: string | undefined;
  sheet: RuntimeComponentEntry[];
  order: number;
  childEntries: SheetGroupEntries;
  childsCount: number;
}

const sheetRegistry = new Map<string, SheetRegistry>();

export const twinShift = async (filename: string, code: string, twin: RuntimeTW) => {
  const ast = project.createSourceFile(filename, code, {
    overwrite: true,
  });

  const componentsList: ResultComponent[] = [];
  const jsxElements = pipe(
    ast.getDescendantsOfKind(SyntaxKind.JsxElement),
    RA.appendAll(ast.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)),
    RA.map((x) => compilerMaps.getJSXElementNode(x, twin)),
    RA.getSomes,
    RA.flatMap((elementNode) => {
      const childs = elementNode.childComponents;
      const counter = elementNode.childComponents.length;
      elementNode.childComponents = RA.map(childs, (childNode, i) => {
        let newSheet = childNode.runtimeEntries;
        childNode.order = i;
        if (elementNode.childRuntimeEntries.first.length > 0 && childNode.order === 0) {
          newSheet = mergeChildEntries(newSheet, elementNode.childRuntimeEntries.first);
        }
        if (
          elementNode.childRuntimeEntries.last.length > 0 &&
          childNode.order === counter - 1
        ) {
          newSheet = mergeChildEntries(newSheet, elementNode.childRuntimeEntries.last);
        }
        childNode.runtimeEntries = newSheet;
        return childNode;
      });

      elementNode.childComponents = childs;
      elementNode.runtimeEntries = excludeChildEntries(elementNode.runtimeEntries);

      return [elementNode, ...childs];
    }),
    RA.dedupeWith((a, b) => a.componentID === b.componentID),
  );

  // for (const element of jsxElements) {
  //   const elementNode = Option.getOrNull(compilerMaps.getJSXElementNode(element, twin));
  //   if (!elementNode) continue;
  //   RA.forEach(elementNode.childComponents, (x) => {
  //     const result: SheetRegistry = {
  //       id: x.componentID,
  //       parentID: elementNode.componentID,
  //       sheet: x.runtimeEntries,
  //       order: x.order,
  //       childEntries: x.childRuntimeEntries,
  //       childsCount: x.childsCount,
  //     };
  //     if (elementNode.childRuntimeEntries.first && x.order === 0) {
  //       result.sheet = mergeChildEntries(
  //         result.sheet,
  //         elementNode.childRuntimeEntries.first,
  //       );
  //     }
  //     if (
  //       elementNode.childRuntimeEntries.first &&
  //       x.order === elementNode.childsCount - 1
  //     ) {
  //       result.sheet = mergeChildEntries(
  //         result.sheet,
  //         elementNode.childRuntimeEntries.last,
  //       );
  //     }
  //     sheetRegistry.set(x.componentID, result);
  //   });
  // }

  for (const element of jsxElements) {
    componentsList.push(visitElementNode(element));
  }

  // ast.forEachDescendant((node, traversal) => {
  //   const elementNode = Option.getOrNull(compilerMaps.getJSXElementNode(node, twin));
  //   if (!elementNode) return undefined;

  //   let order = elementNode.order;
  //   if (sheetRegistry.has(elementNode.componentID)) {
  //     const elementSheet = sheetRegistry.get(elementNode.componentID)!;
  //     order = elementSheet.order;
  //     elementNode.runtimeEntries = elementSheet.sheet;
  //   }

  //   const result = visitElementNode(elementNode, order);
  //   // registerSheet(result);
  //   componentsList.push(...result);
  //   traversal.skip();
  // });

  console.log(inspect(sheetRegistry, false, null, true));

  await ast.save();

  const result = {
    code: ast.getText(),
    full: ast.getFullText(),
    compilerNode: ast.compilerNode.text,
    componentsList,
    sheetRegistry,
  };

  return result;
};

function visitElementNode(node: ResultComponent) {
  const runtimeEntries: RuntimeComponentEntry[] = node.runtimeEntries;
  // const results = [node];

  // if (sheetRegistry.has(node.componentID)) {
  //   const sheet = sheetRegistry.get(node.componentID)!;
  //   runtimeEntries = sheet.sheet;
  //   order = sheet.order;
  // }
  const componentEntries = tsUtils.entriesToObject(node.componentID, runtimeEntries);

  if (!node.openingElement.getAttribute('_twinComponentID')) {
    node.openingElement.addAttribute(
      tsUtils.createJSXAttribute('_twinComponentID', `"${node.componentID}"`),
    );
  }
  if (!node.openingElement.getAttribute('_twinComponentTemplateEntries')) {
    node.openingElement.addAttribute(
      tsUtils.createJSXAttribute(
        '_twinComponentTemplateEntries',
        `${componentEntries.templateEntries}`,
      ),
    );
  }
  if (!node.openingElement.getAttribute('_twinComponentSheet')) {
    node.openingElement.addAttribute(
      tsUtils.createJSXAttribute('_twinComponentSheet', componentEntries.styledProp),
    );
  }
  if (!node.openingElement.getAttribute('ord')) {
    node.openingElement.addAttribute(
      tsUtils.createJSXAttribute('ord', `{${node.order}}`),
    );
  }

  // for (const child of node.childComponents) {
  //   // let order = newOrder;
  //   if (sheetRegistry.has(child.componentID)) {
  //     const elementSheet = sheetRegistry.get(child.componentID)!;
  //     order = elementSheet.order;
  //     child.runtimeEntries = elementSheet.sheet;
  //   }
  //   results.push(...visitElementNode(child, child.order));
  // }

  // const childs = visitElementChilds(node, twin);
  // const childs: ResultComponent[] = [];
  // const childs = pipe(
  //   node.childComponents,
  //   RA.map((x) => {
  //     const parentEntries = parent
  //       ? parent.childRuntimeEntries
  //       : node.childRuntimeEntries;
  //     const mergedEntries = compilerMaps.mergeSheetEntries(
  //       x.runtimeEntries,
  //       parentEntries,
  //       x.order,
  //       parent?.childsCount ?? x.childsCount,
  //     );
  //     const entry = {
  //       ...x,
  //       runtimeEntries: mergedEntries,
  //     };
  //     return entry;
  //   }),
  //   RA.flatMap((x) => visitElementNode(x, twin, x.order, parent).childs),
  // );
  // for (const child of elementChilds) {
  //   visitElementNode(child, twin, order++, parent);
  // }
  // childs.push
  return node;
}

const visitNodeChilds = (
  twin: RuntimeTW,
  parent: ResultComponent,
  childs: ResultComponent[],
  results: ResultComponent[] = [],
  order = 0,
) => {
  const [next, ...rest] = childs;
  if (!next) return results;

  visitElementNode(next);
  return visitNodeChilds(twin, parent, rest, results);
};
