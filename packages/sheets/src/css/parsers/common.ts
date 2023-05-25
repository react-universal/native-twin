import type { Context, PartialStyle, Style } from '../css.types';

export type DeclarationParserFn = (...args: any) => PartialStyle;
export type DeclarationHandlersParserFn = (context: Context) => DeclarationParserFn;

const declarationParser: DeclarationHandlersParserFn = (context) => (property,value) => {
  parser();
};
