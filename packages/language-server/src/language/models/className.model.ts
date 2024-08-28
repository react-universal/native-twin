import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import { TemplateTokenData } from '@native-twin/language-service';

export class ClassNameToken implements Equal.Equal {
  readonly token: TemplateTokenData;
  constructor(token: TemplateTokenData) {
    this.token = token;
  }

  [Equal.symbol](that: unknown) {
    return (
      that instanceof ClassNameToken &&
      this.token.getFullCLassName() === that.token.getFullCLassName()
    );
  }

  [Hash.symbol](): number {
    return Hash.string(this.token.getFullCLassName());
  }
}

export const createClassNameToken = (token: TemplateTokenData) =>
  new ClassNameToken(token);
