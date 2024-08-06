import { Node } from 'ts-morph';
import type {
  ValidJSXClassnameNodeString,
  ValidJSXClassnameTemplate,
  ValidJSXElementNode,
} from './tsCompiler.types';

/** @domain TypeScript Transform */
export const isValidClassNameString = (
  node?: Node,
): node is ValidJSXClassnameNodeString => {
  return (
    Node.isStringLiteral(node) ||
    Node.isTemplateExpression(node) ||
    Node.isNoSubstitutionTemplateLiteral(node) ||
    Node.isIdentifier(node) ||
    Node.isCallExpression(node)
  );
};

export const isValidTemplateLiteral = (
  node?: Node,
): node is ValidJSXClassnameTemplate => {
  return Node.isTemplateExpression(node) || Node.isNoSubstitutionTemplateLiteral(node);
};

/**
 * @domain TypeScript Transform
 * */
export const isValidJSXElement = (element: Node): element is ValidJSXElementNode => {
  return Node.isJsxElement(element) || Node.isJsxSelfClosingElement(element);
};
