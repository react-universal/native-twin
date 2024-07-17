import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { isReactNativeImport, isReactNativeRequire } from '../babel';
import { JSX_IDENTIFIERS } from '../constants/babel.constants';

export const createJSXExpressionHandler = (path: NodePath<t.MemberExpression>) => {
  // const parent = path.parent;
  if (!isJSXExpression()) return null;
  const callExp = path.findParent((x) => t.isCallExpression(x.node));
  if (!t.isCallExpression(callExp?.node)) return null;
  const component = callExp.node.arguments[0];
  if (!t.isMemberExpression(component)) return null;
  if (!t.isIdentifier(component.object)) return null;
  console.log('OBJ', component);
  // if (!t.isIdentifier(component.object.object)) return null;
  const binding = path.scope.getBinding(component.object.name);
  if (!binding) return null;
  if (!isReactNativeImport(binding) || !isReactNativeRequire(binding)) {
    return null;
  }
  return binding;

  function isJSXExpression() {
    return JSX_IDENTIFIERS.some((x) => t.isIdentifier(path.node.property, { name: x }));
  }
};
