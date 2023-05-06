class Lexer {
  private stream = '';
  private cursor = 0;

  private position() {
    return this.stream[this.cursor];
  }

  tokenize(input: string) {
    this.stream = input;
    this.cursor = 0;
    const tokens: any[] = [];
    while (this.cursor < this.stream.length) {
      const currentCharacter = this.position();
      if (!currentCharacter) return;
      if (isEmptySpace(currentCharacter)) {
        // TODO: This is an empty space token
        console.log('FOUND_EMPTY_SPACE', currentCharacter);
        this.cursor++;
        continue;
      }
      if (isLineBreakScape(currentCharacter)) {
        console.log('FOUNT_LINEBREAK', currentCharacter);
        // TODO: This is a line break token
        this.cursor++;
        continue;
      }
      if (isTabScape(currentCharacter)) {
        console.log('FOUND_TAB', currentCharacter);
        // TODO: This is a tab token
        this.cursor++;
        continue;
      }

      if (isMathOperationToken(currentCharacter)) {
        console.log('FOUND_OPERATION', currentCharacter);
        this.cursor++;
        continue;
        // TODO: This is a Math operation value
      }

      if (isNumericValue(currentCharacter)) {
        // TODO: This is a numeric value
        console.log('FOUND_NUMERIC', currentCharacter);
        this.cursor++;
      } else {
        throw new Error(`Expected a valid token at position: ${this.cursor}`);
      }
    }
  }
}

// The UNICODE value of Numbers in range 0-9 the range 48-57 in Unicode ASCII
function isNumericValue(value: string) {
  return value.charCodeAt(0) >= 48 && value.charCodeAt(0) <= 57;
}

function isEmptySpace(value: string) {
  return value == ' ';
}

function isLineBreakScape(value: string) {
  return value == '\n';
}

function isTabScape(value: string) {
  return value == '\t';
}

function isMathOperationToken(value: string) {
  const operationTokens = ['+', '-', '/', '*'];
  const lookup = operationTokens.indexOf(value);
  if (lookup) {
    return operationTokens[lookup]!;
  }
  return null;
}

enum OperationTokenTypes {
  PLUS,
  MINUS,
  MULTIPLY,
  DIVIDE,
  INTEGER,
  EOF,
}

const lexer = new Lexer();
console.log(
  'LEXER: ',
  lexer.tokenize(`
          1 / 2ss
`),
);
