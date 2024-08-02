import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { Identifier, Node, ts } from 'ts-morph';
import { RuntimeComponentEntry } from '../../sheet/sheet.types';
import { JSXElementNode } from '../models/JSXElement.model';
import { ValidOpeningElementNode } from '../twin.types';
import {
  createJSXAttribute,
  entriesToObject,
  getImportDeclaration,
} from './constructors.utils';

export function visitElementNode(node: JSXElementNode, sheet: RuntimeComponentEntry[]) {
  const componentEntries = entriesToObject(node.id.id, sheet);

  pipe(
    getOpeningElement(node.path.node),
    Option.map((element) => {
      if (!element.getAttribute('_twinComponentID')) {
        element.addAttribute(createJSXAttribute('_twinComponentID', `"${node.id.id}"`));
      }
      if (!element.getAttribute('_twinComponentTemplateEntries')) {
        element.addAttribute(
          createJSXAttribute(
            '_twinComponentTemplateEntries',
            `${componentEntries.templateEntries}`,
          ),
        );
      }
      if (!element.getAttribute('_twinComponentSheet')) {
        element.addAttribute(
          createJSXAttribute('_twinComponentSheet', componentEntries.styledProp),
        );
      }
    }),
  );

  return { node, sheet, entries: RA.flatMap(sheet, (x) => x.entries) };
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

export const getOpeningElement = (node: Node): Option.Option<ValidOpeningElementNode> => {
  if (Node.isJsxElement(node)) {
    return Option.some(node.getOpeningElement());
  } else if (Node.isJsxSelfClosingElement(node)) {
    return Option.some(node);
  }
  return Option.none();
};
