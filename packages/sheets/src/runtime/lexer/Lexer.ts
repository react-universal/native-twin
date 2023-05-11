import { CommentsParser } from './Parser';
import { TokenType } from './types';

export class Lexer {
  private stream = '';
  private cursor = 0;
  private context: TokenType;
  private currentSelector: string = '';
  declarations: { value: string; property: string; selector: string }[] = [];
  variables: [string, string][] = [];
  comments: string[] = [];
  lineNumber = 1;
  columnNumber = 1;

  get #position() {
    return this.stream[this.cursor];
  }

  #consumeSelector() {
    let buffer = '';
    while (this.#position !== '{') {
      buffer += this.#position;
      this.cursor++;
    }
    this.context = TokenType.RULE;
    this.currentSelector = buffer;
  }

  #consumeNumber() {
    let buffer = '';
    while (
      this.#position &&
      this.#position.charCodeAt(0) >= 48 &&
      this.#position.charCodeAt(0) <= 57
    ) {
      buffer += this.#position;
      this.cursor++;
    }
    return buffer;
  }

  #consumeComment() {
    let buffer = '/*';
    this.#next(2);
    // while (this.#position != '/') {
    //   buffer += this.#position;
    //   this.next();
    // }
    // this.next();
    this.comments.push(new CommentsParser(this.stream.slice(this.cursor)).consume());
    return buffer;
  }

  #consumeRule() {
    let buffer = '';
    const tokens: any[] = [];
    this.cursor++;
    while (this.#position !== '}') {
      buffer += this.#position;
      this.cursor++;
    }
    buffer.split(';').forEach((item) => {
      const declaration = item.split(':');
      const property = declaration[0];
      const value = declaration[1];
      if (property && value) {
        if (property.startsWith('--')) {
          this.variables.push([property, value]);
        } else {
          this.declarations.push({ value, property, selector: this.currentSelector });
        }
      }
    });
    this.context = TokenType.SELECTOR;
    return tokens;
  }

  #peek(n = 1) {
    return this.stream[this.cursor + n];
  }

  #next(newCursor = 1) {
    this.cursor += newCursor;
  }

  #precedence() {
    return this.stream[this.cursor - 1];
  }

  constructor() {
    this.context = TokenType.SELECTOR;
  }
  // asdasd
  tokenize(input: string) {
    this.stream = input;
    this.cursor = 0;
    while (this.cursor < this.stream.length) {
      const currentCharacter = this.#position;
      if (currentCharacter == '/' && this.#peek() == '*') {
        this.#consumeComment();
      }
      if (!currentCharacter) return;

      if (this.context == TokenType.SELECTOR) {
        this.#consumeSelector();
      }
      if (this.context == TokenType.RULE) {
        this.#consumeRule();
      }
      this.cursor++;
    }
    return {
      declarations: this.declarations,
      comments: this.comments,
      variables: this.variables,
    };
  }
}
