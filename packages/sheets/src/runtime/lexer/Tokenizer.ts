export enum TokenTypes {
  NUMBER,
  MATH_OPERATION,
  INTEGER,
  LINE_BREAK,
  TAB,
  STRING,
  EOF,
}

export class TokenNode {
  constructor(public value: string, public tokenType: TokenTypes) {
    this.value = value;
    this.tokenType = tokenType;
  }
}

export class Tokenizer {
  _text: string = '';
  _cursor: number = 0;

  init(text: string) {
    this._text = text;
    this._cursor = 0;
  }

  hasNext() {
    return this._cursor < this._text.length;
  }

  next() {
    if (!this.hasNext()) {
      return null;
    }
    const currentText = this._text.slice(this._cursor);
    if (currentText && isNumericValue(currentText)) {
      let number = '';
      while (currentText[this._cursor] && isNumericValue(currentText[this._cursor])) {
        number += currentText[this._cursor];
        this._cursor++;
      }
      return {
        type: 'NUMBER',
        value: number,
      };
    }
    return null;
  }
}

function isNumericValue(value?: string) {
  if (!value) return false;
  return value.charCodeAt(0) >= 48 && value.charCodeAt(0) <= 57;
}
