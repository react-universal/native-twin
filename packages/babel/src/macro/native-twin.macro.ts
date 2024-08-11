import { MacroParams, createMacro } from 'babel-plugin-macros';

module.exports = createMacro(jsxMacro);

function jsxMacro({ references, state, babel }: MacroParams) {
  // `state` is the second argument you're passed to a visitor in a
  // normal babel plugin. `babel` is the `@babel/core` module.
  // do whatever you like to the AST paths you find in `references`.
  // open up the console to see what's logged and start playing around!
  // references.default refers to the default import (`myMacro` above)
  // references.JSXMacro refers to the named import of `JSXMacro`
  const { JSXMacro = [], default: defaultImport = [] } = references;
  defaultImport.forEach((referencePath) => {
    if (!referencePath.parentPath) return;

    if (referencePath.parentPath.type === 'TaggedTemplateExpression') {
      console.log('template literal contents', referencePath.parentPath.get('quasi'));
    }

    if (referencePath.parentPath.type === 'CallExpression') {
      if (referencePath === referencePath.parentPath.get('callee')) {
        console.log(
          'function call arguments (as callee)',
          referencePath.parentPath.get('arguments'),
        );
        return;
      }

      const parentPathArgs = referencePath.parentPath.get('arguments');
      if (Array.isArray(parentPathArgs) && parentPathArgs.includes(referencePath)) {
        console.log(
          'function call arguments (as argument)',
          referencePath.parentPath.get('arguments'),
        );
      }
    }
  });

  JSXMacro.forEach((referencePath) => {
    if (!referencePath.parentPath) return;
    if (
      referencePath.parentPath.type === 'JSXOpeningElement' &&
      referencePath.parentPath.parentPath
    ) {
      console.log('jsx props', {
        attributes: referencePath.parentPath.get('attributes'),
        children: referencePath.parentPath.parentPath.get('children'),
      });
    } else {
      // throw a helpful error message or something :)
    }
  });
}
