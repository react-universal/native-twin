import { Context, type Effect } from 'effect';

export namespace TwinParser {
  export interface TwinJSXMappedPropNode<AST> {
    ast: AST;
    classProp: string;
    styleProp: string;
    value: string | null;
  }
  export interface TwinJSXNode<AST, ASTProp> {
    ast: AST;
    tagName: string;
    mappedProps: TwinJSXMappedPropNode<ASTProp>[];
  }

  export interface TwinJSXVarNode<AST, JSXNodes, AST_Props> {
    name: string;
    ast: AST;
    rootNode: TwinJSXNode<JSXNodes, AST_Props>;
  }
  export interface TwinASTFile<AST, AST_Declarator, AST_JSX, AST_Prop> {
    ast: AST;
    jsxDeclarators: TwinJSXVarNode<AST_Declarator, AST_JSX, AST_Prop>[];
  }
}

export interface TwinParserAdapter<AST_File, AST_Declarator, AST_JSXNode, AST_Prop> {
  parseFile(
    filePath: string,
    text: string,
  ): Effect.Effect<TwinParser.TwinASTFile<AST_File, AST_Declarator, AST_JSXNode, AST_Prop>>;
  parseDeclaration(
    ast: AST_Declarator,
  ): TwinParser.TwinJSXVarNode<AST_Declarator, AST_JSXNode, AST_Prop>;
  parseJSXNode(ast: AST_JSXNode): TwinParser.TwinJSXNode<AST_JSXNode, AST_Prop>;
}

export const TwinParserContext = Context.GenericTag<
  TwinParserAdapter<unknown, unknown, unknown, unknown>
>('adapters/TwinParserContext');
