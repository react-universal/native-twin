import { coroutine, letters, peek } from '@universal-labs/css/parser';

export function parse(text: string, _position: number) {
  return coroutine((run) => {
    return parseValues();

    function parseNextSegment() {
      return run(letters);
    }

    function parseValues() {
      const nextChar = run(peek);
      if (!nextChar) return;
      return parseNextSegment();
    }
  }).run(text);
}
