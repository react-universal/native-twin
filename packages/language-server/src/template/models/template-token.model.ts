import * as Equal from 'effect/Equal';
import * as ReadonlyArray from 'effect/Array';
import * as Hash from 'effect/Hash';
import { getFlattenTemplateToken } from '../../language/utils/language.utils';
import {
  LocatedGroupToken,
  LocatedGroupTokenWithText,
  TemplateToken,
} from '../template.types';

export class TemplateTokenWithText implements Equal.Equal {
  readonly token: Exclude<TemplateToken, LocatedGroupToken> | LocatedGroupTokenWithText;
  loc: {
    readonly start: number;
    readonly end: number;
  };
  bodyLoc: {
    readonly start: number;
    readonly end: number;
  };
  text: string;
  templateStarts: number;

  get flattenToken() {
    return ReadonlyArray.dedupe(getFlattenTemplateToken(this));
  }

  constructor(
    token: Exclude<TemplateToken, LocatedGroupToken> | LocatedGroupTokenWithText,
    text: string,
    templateStarts: number,
  ) {
    this.templateStarts = templateStarts;
    this.loc = {
      end: token.end,
      start: token.start,
    };
    this.bodyLoc = {
      end: token.end + templateStarts,
      start: token.start + templateStarts,
    };
    this.text = text;
    this.token = token;
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof TemplateTokenWithText &&
      this.text === that.text &&
      this.bodyLoc.start === that.bodyLoc.start &&
      this.bodyLoc.end === that.bodyLoc.end
    );
  }

  [Hash.symbol]() {
    return Hash.array([this.text, this.bodyLoc.start, this.bodyLoc.end]);
  }
}
