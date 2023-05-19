import camelize from 'fbjs/lib/camelize';
import {
  TokenTypeMap,
  TokenType,
  CommentNode,
  SelectorNode,
  RuleNode,
  DeclarationNode,
  TokenNode,
} from './ast-tokens';

const createToken = <T extends TokenType>(type: T, value: string): TokenNode<T, string> => {
  if (type === 'COMMENT') {
    return new CommentNode(value as string) as TokenNode<T, string>;
  }
  if (type === 'SELECTOR') {
    return new SelectorNode(value as string) as TokenNode<'DECLARATION', string>;
  }
  if (type === 'RULE') {
    return new RuleNode(value as string) as TokenNode<T, string>;
  }
  throw new SyntaxError(`unknown token type: ${type}`);
};

type LexerState = {
  cursor: number;
  currentContext: TokenType;
  tokens: TokenNode<TokenType, any>[];
};

function getLexerContext(currentTarget: string): TokenType {
  if (currentTarget.startsWith('/*')) {
    return TokenTypeMap.COMMENT;
  }
  if (currentTarget.startsWith('.') || currentTarget.startsWith('#')) {
    return TokenTypeMap.SELECTOR;
  }

  if (currentTarget.startsWith('{')) {
    return TokenTypeMap.RULE;
  }
  throw new SyntaxError(
    `trying to predict context but target starts with: "${currentTarget.slice(0, 2)}"`,
  );
}

const getStylePropertyName = (property: string) => {
  return camelize(property);
};

const getStylePropertyValue = (value: string) => {
  // const nextState = matchDeclarationValue.run(value);
  // if (nextState.result?.type === 'unit') {
  //   const { unit, value: declarationValue } = nextState.result;
  //   if (unit.includes('em')) {
  //     return (parseFloat(declarationValue) * 16) as any as string;
  //   }
  //   if (unit.includes('vh')) {
  //     return (dimensions.height * (Number(declarationValue) / 100)) as any as string;
  //   }
  //   if (unit.includes('vw')) {
  //     return (dimensions.width * (Number(declarationValue) / 100)) as any as string;
  //   }
  // }
  return value;
};

const tokenizeDeclarations = (css: string) => {
  const declarations = css.split(';');
  const validDeclarations: DeclarationNode[] = [];
  const variables: Record<string, string> = {};
  for (const current of declarations) {
    const splitted = current.split(':');
    const declaration = {
      property: splitted[0],
      value: splitted[1],
    };
    if (!declaration.property || !declaration.value) {
      continue;
    }
    if (declaration.property.startsWith('--')) {
      variables[declaration.property] = declaration.value;
    } else {
      const newValue = declaration.value.replace(/var\((--[\w-]+)\)/g, (match, p1) =>
        p1 in variables ? variables[p1]! : match,
      );
      const newProperty = getStylePropertyName(declaration.property);
      const value = getStylePropertyValue(newValue);
      validDeclarations.push(new DeclarationNode({ property: newProperty, value }));
    }
  }
  return validDeclarations;
};

const tokenize = (currentTarget: string, currentState: LexerState): LexerState => {
  if (currentState.currentContext == TokenTypeMap.COMMENT) {
    const start = currentTarget.indexOf('/*');
    const end = currentTarget.indexOf('*/');
    if (start === 0 && end !== -1) {
      const newState: LexerState = {
        ...currentState,
        cursor: currentState.cursor + end + 2,
        currentContext: TokenTypeMap.UNKNOWN,
        tokens: [
          ...currentState.tokens,
          createToken(TokenTypeMap.COMMENT, currentTarget.slice(2, end)),
        ],
      };
      return newState;
    }
  }

  if (currentState.currentContext == TokenTypeMap.SELECTOR) {
    const end = currentTarget.indexOf('{');
    if (end !== -1) {
      const newState: LexerState = {
        ...currentState,
        cursor: currentState.cursor + end,
        currentContext: TokenTypeMap.UNKNOWN,
        tokens: [
          ...currentState.tokens,
          createToken(TokenTypeMap.SELECTOR, currentTarget.slice(1, end)),
        ],
      };
      return newState;
    }
  }

  if (currentState.currentContext == TokenTypeMap.RULE) {
    const end = currentTarget.indexOf('}');
    if (end !== -1) {
      const newState: LexerState = {
        ...currentState,
        cursor: currentState.cursor + end + 1,
        currentContext: TokenTypeMap.UNKNOWN,
        tokens: [
          ...currentState.tokens,
          createToken(TokenTypeMap.RULE, currentTarget.slice(1, end)),
        ],
      };
      const declarations = tokenizeDeclarations(currentTarget.slice(1, end));
      console.log('DECL: ', declarations);
      return newState;
    }
  }
  return currentState;
};

function cssToAst(
  source: string,
  currentState: LexerState = {
    cursor: 0,
    tokens: [],
    currentContext: TokenTypeMap.UNKNOWN,
  },
): LexerState {
  const currentTarget = source.slice(currentState.cursor);
  if (currentTarget.length == 0) {
    currentState.currentContext = TokenTypeMap.EOF;
    return currentState;
  }

  if (currentState.currentContext == TokenTypeMap.UNKNOWN) {
    currentState.currentContext = getLexerContext(currentTarget);
    if (!currentTarget) {
      throw new SyntaxError(`Unexpected token "${currentTarget}" at ${currentState.cursor}`);
    }
  }

  const nextState = tokenize(currentTarget, currentState);
  if (nextState.cursor == currentState.cursor) {
    throw new SyntaxError(`Unexpected token "${currentTarget}" at ${currentState.cursor}`);
  }
  return cssToAst(source, nextState);
}

const css =
  '/*!dbgidc,t,text-gray-800*/#text-gray-800{--tw-text-opacity:1;color:rgba(31,41,55,var(--tw-text-opacity));}/*!dbgidc,w,text-xl*/.text-xl{font-size:1.25rem;line-height:1.75rem;}/*!dbgidc,y,leading-6*/.leading-6{line-height:1.5rem;}/*!dbjbi8,t,group-hover:text-white*/.group:hover .group-hover\\:text-white{--tw-text-opacity:1;color:rgba(255,255,255,var(--tw-text-opacity));}';

cssToAst(css);
