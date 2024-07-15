import { Binding, NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { RuntimeTW } from '@native-twin/core';
import { visitJSXAttribute } from './jsx.attribute';

export function visitJSXOpeningElement(
  path: NodePath<t.JSXOpeningElement>,
  twin: RuntimeTW,
) {
  if (!t.isJSXIdentifier(path.node.name)) return;
  const binding = path.scope.getBinding(path.node.name.name);

  if (!binding || !isReactNativeImport(binding)) {
    return;
  }
  path.traverse({
    JSXAttribute: (attribute) => {
      visitJSXAttribute(path, attribute, twin);
    },
  });
}

const isReactNativeImport = (binding: Binding) => {
  return (
    t.isImportSpecifier(binding.path.node) &&
    t.isImportDeclaration(binding.path.parent) &&
    binding.path.parent.source.value === 'react-native'
  );
};
