export function TokenStream(input: string) {
  let current = input;
  return { isDigit, current };

  function isDigit(char: string) {
    return /[0-9]/i.test(char);
  }
}
