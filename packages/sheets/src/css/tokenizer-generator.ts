import { removeCssComment } from './helpers';

function declarationCanBeReplaced /* #__PURE__ */(value: unknown): asserts value is string {
  if (typeof value !== 'string')
    throw new SyntaxError(`trying to parse ${value} as string but got: ${typeof value}`);
}

function replaceDeclarationVariables /* #__PURE__ */(declarations: string) {
  if (declarations.includes('var(')) {
    const variable = declarations.split(';');
    let variableRule = variable[0];
    let declaration = `${variable[1]}`;
    declarationCanBeReplaced(variableRule);
    const slicedDeclaration = variableRule.split(':');
    const variableName = slicedDeclaration[0];
    const variableValue = slicedDeclaration[1];
    declarationCanBeReplaced(variableValue);
    return declaration.replace(/(var\((--[\w-]+)\))/g, (match, _p1, p2) => {
      if (p2 === variableName) {
        return variableValue;
      }
      return match;
    });
  }
  return declarations;
}

function createLexer /* #__PURE__ */() {
  let css = '';
  return {
    injectCss(newCss: string) {
      css += removeCssComment(newCss);
    },
    parse: function* () {
      let cursor = 0;

      const sliceCss = (from: number, to: number) => {
        return css.slice(from, to);
      };

      const getSelector = () => {
        cursor = css.indexOf('{');
        const selector = sliceCss(0, cursor);
        css = css.slice(cursor);
        return selector;
      };

      const getDeclarations = () => {
        cursor = css.indexOf('}') + 1;
        const ruleDeclarations = sliceCss(1, cursor - 1);
        css = css.slice(cursor);
        return replaceDeclarationVariables(ruleDeclarations);
      };

      while (true) {
        if (css.length === 0) {
          cursor = 0;
          return;
        }
        const selector = getSelector();
        const declarations = getDeclarations();
        yield {
          selector,
          declarations,
        };
      }
    },
  };
}

export const CssLexer = createLexer();
