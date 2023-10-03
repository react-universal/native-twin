// Based on https://stackoverflow.com/a/52171480
export function hash(value: string): string {
  for (var h = 9, index = value.length; index--; ) {
    h = Math.imul(h ^ value.charCodeAt(index), 0x5f356495);
  }

  return '#' + ((h ^ (h >>> 9)) >>> 0).toString(36);
}
