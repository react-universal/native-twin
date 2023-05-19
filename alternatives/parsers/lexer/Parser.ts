import type { TokenType } from './types';

type Token<T> = {
  type: TokenType;
  value: T;
};

export class TokensParser<T> {
  #tokens: Token<T>[];
  #cursor = 0;

  #peek(n = 1) {
    return this.#tokens[this.#cursor + n];
  }

  #next(newCursor = 1) {
    this.#cursor += newCursor;
  }

  #at() {
    return this.#tokens[this.#cursor];
  }

  #consumeToken(tokenType: TokenType) {
    if (tokenType == this.#at()?.type) {
      this.#cursor++;
    } else {
      throw new SyntaxError(`Expected a token to be of type: ${tokenType}`);
    }
  }

  constructor(tokens: any) {
    this.#tokens = tokens;
  }
}

export class CommentsParser {
  #stream: string;
  #cursor: number;
  #consumed: string;
  constructor(stream: string) {
    this.#stream = stream;
    this.#cursor = 0;
    this.#consumed = '';
  }

  #advance(n = 1) {
    this.#cursor += n;
  }

  #at() {
    return this.#stream[this.#cursor];
  }

  consume() {
    this.#consumed = '/*';
    this.#advance(2);
    console.log('AT: ', this.#stream, this.#at());
    while (this.#at() != '/') {
      this.#consumed += this.#at();
      this.#advance();
    }
    this.#advance();
    this.#consumed = `${this.#consumed}/`;
    return this.#consumed;
  }
}
