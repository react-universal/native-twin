export function separatorPrecedence(string: string): number {
  return string.match(/[-=:;]/g)?.length || 0;
}

export function atRulePrecedence(css: string): number {
  // 0 - 15: 4 bits (max 144rem or 2304px)
  // rem -> bit
  // <20 ->  0 (<320px)
  //  20 ->  1 (320px)
  //  24 ->  2 (384px)
  //  28 ->  3 (448px)
  //  32 ->  4 (512px)
  //  36 ->  5 (576px)
  //  42 ->  6 (672px)
  //  48 ->  7 (768px)
  //  56 ->  8 (896px)
  //  64 ->  9 (1024px)
  //  72 -> 10 (1152px)
  //  80 -> 11 (1280px)
  //  96 -> 12 (1536px)
  // 112 -> 13 (1792px)
  // 128 -> 14 (2048px)
  // 144 -> 15 (2304px)
  // https://www.dcode.fr/function-equation-finder
  return (
    (Math.min(
      /(?:^|width[^\d]+)(\d+(?:.\d+)?)(p)?/.test(css)
        ? Math.max(0, 29.63 * (+RegExp.$1 / (RegExp.$2 ? 15 : 1)) ** 0.137 - 43)
        : 0,
      15,
    ) <<
      22) /* Shifts.responsive */ |
    (Math.min(separatorPrecedence(css), 15) << 18) /* Shifts.atRules */
  );
}
