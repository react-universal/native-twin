export const debugLog = <T>(
  _input: { symbol: '📗' | '📘' | '📕'; msg: string; value: T },
  debug = false,
) => {
  if (debug) {
    // eslint-disable-next-line no-console
    console.debug(`(${_input.symbol}) - ${_input.msg}`, _input.value);
  }
};
