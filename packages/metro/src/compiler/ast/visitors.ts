import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { Identifier, ts } from 'ts-morph';
import { JSXElementSheet } from '@native-twin/css/jsx';
import { JSXElementNode } from '../models/JSXElement.model';
import { entriesToObject, getImportDeclaration } from './constructors.utils';
import { addAttributeToNode } from './shared.utils';

export function visitElementNode(node: JSXElementNode, sheet: JSXElementSheet) {
  // if (sheet.propEntries.length === 0) {
  //   return {
  //     node,
  //     sheet,
  //     rawEntries: RA.flatMap(sheet.propEntries, (x) => x.entries),
  //   };
  // }
  const componentEntries = entriesToObject(
    node.id,
    pipe(
      sheet.propEntries,
      RA.map((prop) => {
        return {
          ...prop,
          rawSheet: {
            ...prop.rawSheet,
            even: [],
            first: [],
            last: [],
            odd: [],
          },
        };
      }),
    ),
  );

  addAttributeToNode(node.path, '_twinOrd', node.order);
  addAttributeToNode(node.path, '_twinComponentID', `"${node.id}"`);
  addAttributeToNode(
    node.path,
    '_twinComponentTemplateEntries',
    `${componentEntries.templateEntries}`,
  );
  addAttributeToNode(node.path, '_twinComponentSheet', componentEntries.styledProp);
  // pipe(
  //   node.openingElement,
  //   Option.map((element) => {
  //     node.addAttribute('_twinOrd', `{${node.order}}`);
  //     node.addAttribute('_twinComponentID', `{${node.id}}`);
  //     node.addAttribute(
  //       '_twinComponentTemplateEntries',
  //       `${componentEntries.templateEntries}`,
  //     );
  //     node.addAttribute('_twinComponentSheet', componentEntries.styledProp);
  // if (!element.getAttribute('_twinOrd')) {
  //   element.addAttribute(createJSXAttribute('_twinOrd', `{${node.order}}`));
  // }
  // if (!element.getAttribute('_twinComponentID')) {
  //   element.addAttribute(createJSXAttribute('_twinComponentID', `"${node.id}"`));
  // }
  // if (!element.getAttribute('_twinComponentTemplateEntries')) {
  //   element.addAttribute(
  //     createJSXAttribute(
  //       '_twinComponentTemplateEntries',
  //       `${componentEntries.templateEntries}`,
  //     ),
  //   );
  // }
  // if (!element.getAttribute('_twinComponentSheet')) {
  //   element.addAttribute(
  //     createJSXAttribute('_twinComponentSheet', componentEntries.styledProp),
  //   );
  // }
  // }),
  // );

  return { node, sheet, rawEntries: RA.flatMap(sheet.propEntries, (x) => x.entries) };
}

export const maybeReactNativeImport = (
  ident: Identifier,
): Option.Option<ts.ImportDeclaration> => {
  return Option.fromNullable(getImportDeclaration(ident)).pipe(
    Option.flatMap((x) => {
      const moduleSpecifier = x.moduleSpecifier;
      if (!ts.isStringLiteral(moduleSpecifier)) return Option.none();
      if (moduleSpecifier.text !== 'react-native') return Option.none();

      return Option.some(x);
    }),
  );
};
