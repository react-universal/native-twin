export function InputStream(input: string) {
  let position = 0;
  let line = 1;
  let column = 0;
  return {
    next,
    peek,
    eof,
    croak,
  };

  function next() {
    let char = input.charAt(position++);
    if (char == '\n') line++, (column = 0);
    else column++;
    return char;
  }

  function peek() {
    return input.charAt(position);
  }

  function eof() {
    return peek() === '';
  }

  function croak(message: string) {
    throw new SyntaxError(`${message} (${line}:${column})`);
  }
}
