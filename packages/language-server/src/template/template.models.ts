import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import { ClassNameToken, VariantToken } from '@native-twin/css';
import { LocatedGroupToken, LocatedParser, TemplateToken } from './template.types';

export class TemplateTokenWithText implements Equal.Equal {
  readonly token: Exclude<TemplateToken, LocatedGroupToken> | LocatedGroupTokenWithText;
  readonly loc: {
    readonly start: number;
    readonly end: number;
  };
  text: string;

  constructor(
    token: Exclude<TemplateToken, LocatedGroupToken> | LocatedGroupTokenWithText,
    text: string,
  ) {
    this.loc = {
      end: token.end,
      start: token.start,
    };
    this.text = text;
    this.token = token;
  }

  [Equal.symbol](that: unknown): boolean {
    return that instanceof TemplateTokenWithText && this.text === this.text;
  }

  [Hash.symbol]() {
    return Hash.string(this.text);
  }
}

export interface LocatedGroupTokenWithText {
  type: 'GROUP';
  start: number;
  end: number;
  value: {
    base:
      | (LocatedParser<ClassNameToken> & { text: string })
      | (LocatedParser<VariantToken> & { text: string });
    content: TemplateTokenWithText[];
  };
}
