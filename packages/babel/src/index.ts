import babel, { PluginObj } from '@babel/core';
import syntax from '@babel/plugin-syntax-jsx';

export default function nativeTwinBabelPlugin({ types: t }: typeof babel): PluginObj {
  return {
    inherits: syntax,
    visitor: {
      Identifier: {
        enter(path) {
          // const isTemplate = t.isTemplateLiteral(path.node);
          // console.log('IS_TEMPLATE: ', isTemplate);
        },
      },
      TaggedTemplateExpression: {
        enter(path, state) {
          t.traverse(path.node, {
            enter(node) {
              if (node.type == 'TaggedTemplateExpression') {
                // console.log('TaggedTemplateExpression: ', node);
              }
              if (node.type == 'TemplateLiteral') {
                // console.log('TemplateLiteral: ', node.quasis);
              }
              if (node.type == 'TemplateElement') {
                console.log('TemplateElement: ', node);
              }
            },
          });
        },
      },
    },
    name: 'Native Twin',
  };
}
