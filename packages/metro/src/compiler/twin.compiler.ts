import * as Option from 'effect/Option';
import { Project } from 'ts-morph';
import type { RuntimeTW } from '@native-twin/core';
import * as compilerMaps from './twin.maps';
import { type ResultComponent } from './twin.types';
import * as tsUtils from './utils/ts.utils';

const project = new Project({
  useInMemoryFileSystem: true,
});

export const twinShift = async (filename: string, code: string, twin: RuntimeTW) => {
  const ast = project.createSourceFile(filename, code, {
    overwrite: true,
  });

  const componentsList: Option.Option<ResultComponent>[] = [];
  ast.forEachDescendant((node, _traversal) => {
    const elementNode = compilerMaps.getJSXElementNode(node);

    Option.map(elementNode, (x) => compilerMaps.addOrderToChilds(x.jsxElement, 0));

    const componentStyles = Option.map(elementNode, ({ componentID, componentEntries }) => {
      const entries = compilerMaps.getComponentEntries(twin, componentEntries);
      return { rawEntries: tsUtils.entriesToObject(componentID, entries), entries };
    });

    const result: Option.Option<ResultComponent> = Option.zipWith(
      elementNode,
      componentStyles,
      (elementNode, styles) => {
        const openingElement = tsUtils.getJSXOpeningElement(elementNode.jsxElement);
        openingElement.addAttribute(
          tsUtils.createJSXAttribute('_twinComponentID', `"${elementNode.componentID}"`),
        );
        openingElement.addAttribute(
          tsUtils.createJSXAttribute('_twinComponentSheet', styles.rawEntries.styledProp),
        );

        openingElement.addAttribute(
          tsUtils.createJSXAttribute(
            '_twinComponentTemplateEntries',
            `${styles.rawEntries.templateEntries}`,
          ),
        );
        return {
          elementNode,
          styles,
        };
      },
    );
    componentsList.push(result);
  });

  await ast.save();

  const result = {
    code: ast.getText(),
    full: ast.getFullText(),
    compilerNode: ast.compilerNode.text,
    componentsList,
  };

  return result;
};
