export const globalKeywords = [
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset',
] as const;

export const directionMap = {
  l: ['Left'],
  r: ['Right'],
  t: ['Top'],
  b: ['Bottom'],
  // s: ['InlineStart'],
  // e: ['InlineEnd'],
  x: ['Left', 'Right'],
  y: ['Top', 'Bottom'],
  '': [''],
  // bs: ['BlockStart'],
  // be: ['BlockEnd'],
  // block: ['BlockStart', 'BlockEnd'],
} satisfies Record<string, string[]>;

export const cornerMap = {
  l: ['TopLeft', 'BottomLeft'],
  r: ['TopRight', 'BottomRight'],
  t: ['TopLeft', 'TopRight'],
  b: ['BottomLeft', 'BottomRight'],
  tl: ['TopLeft'],
  lt: ['TopLeft'],
  tr: ['TopRight'],
  rt: ['TopRight'],
  bl: ['BottomLeft'],
  lb: ['BottomLeft'],
  br: ['BottomRight'],
  rb: ['BottomRight'],
  bs: ['StartStart', 'StartEnd'],
  be: ['EndStart', 'EndEnd'],
  s: ['EndStart', 'StartStart'],
  is: ['EndStart', 'StartStart'],
  e: ['StartEnd', 'EndEnd'],
  ie: ['StartEnd', 'EndEnd'],
  ss: ['StartStart'],
  'bs-is': ['StartStart'],
  'is-bs': ['StartStart'],
  se: ['StartEnd'],
  'bs-ie': ['StartEnd'],
  'ie-bs': ['StartEnd'],
  es: ['EndStart'],
  'be-is': ['EndStart'],
  'is-be': ['EndStart'],
  ee: ['EndEnd'],
  'be-ie': ['EndEnd'],
  'ie-be': ['EndEnd'],
} satisfies Record<string, string[]>;

// prettier-ignore
export const commonCssProps = [
  // basic props
  'color', 'border-color', 'background-color', 'flex-grow', 'flex', 'flex-shrink',
  'caret-color', 'font', 'gap', 'opacity', 'visibility', 'z-index', 'font-weight',
  'zoom', 'text-shadow', 'transform', 'box-shadow',

  // positions
  'background-position', 'left', 'right', 'top', 'bottom', 'object-position',

  // sizes
  'max-height', 'min-height', 'max-width', 'min-width', 'height', 'width',
  'border-width', 'margin', 'padding', 'outline-width', 'outline-offset',
  'font-size', 'line-height', 'text-indent', 'vertical-align',
  'border-spacing', 'letter-spacing', 'word-spacing',

  // enhances
  'stroke', 'filter', 'backdrop-filter', 'fill', 'mask', 'mask-size', 'mask-border', 'clip-path', 'clip',
  'border-radius',
];
