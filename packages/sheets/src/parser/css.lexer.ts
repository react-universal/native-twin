interface Token {
  selector: string;
  media: string | null;
  value: string;
}

export class CssLexer {
  target: string;
  cursor: number;

  #at(cursor = this.cursor) {
    return this.target.charAt(cursor);
  }

  #tokenizeSelector() {
    let result = '';
    do {
      result += this.#at();
      this.cursor++;
    } while (this.#at() != '{');
    this.cursor++;
    return result;
  }

  #tokenizeRule(): Token {
    let result = '';
    const selector = this.#tokenizeSelector();
    do {
      result += this.#at();
      this.cursor++;
    } while (this.#at(this.cursor) != '}');
    this.cursor++;
    return {
      value: result,
      selector,
      media: null,
    };
  }

  constructor(target: string) {
    this.target = target;
    this.cursor = 0;
  }

  tokenize(tokens: Token[] = []): Token[] {
    if (this.cursor === this.target.length) {
      return tokens;
    }
    const token = this.#tokenizeRule();
    tokens.push(token);
    return this.tokenize(tokens);
  }
}
