export const globalKeywords = [
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset',
] as const;

export const directionMap = {
  l: ['-left'],
  r: ['-right'],
  t: ['-top'],
  b: ['-bottom'],
  s: ['-inline-start'],
  e: ['-inline-end'],
  x: ['-left', '-right'],
  y: ['-top', '-bottom'],
  '': [''],
  bs: ['-block-start'],
  be: ['-block-end'],
  is: ['-inline-start'],
  ie: ['-inline-end'],
  block: ['-block-start', '-block-end'],
  inline: ['-inline-start', '-inline-end'],
} satisfies Record<string, string[]>;

export const insetMap: Record<string, string[]> = {
  ...directionMap,
  s: ['-inset-inline-start'],
  start: ['-inset-inline-start'],
  e: ['-inset-inline-end'],
  end: ['-inset-inline-end'],
  bs: ['-inset-block-start'],
  be: ['-inset-block-end'],
  is: ['-inset-inline-start'],
  ie: ['-inset-inline-end'],
  block: ['-inset-block-start', '-inset-block-end'],
  inline: ['-inset-inline-start', '-inset-inline-end'],
};

export const cornerMap = {
  l: ['-top-left', '-bottom-left'],
  r: ['-top-right', '-bottom-right'],
  t: ['-top-left', '-top-right'],
  b: ['-bottom-left', '-bottom-right'],
  tl: ['-top-left'],
  lt: ['-top-left'],
  tr: ['-top-right'],
  rt: ['-top-right'],
  bl: ['-bottom-left'],
  lb: ['-bottom-left'],
  br: ['-bottom-right'],
  rb: ['-bottom-right'],
  '': [''],
  bs: ['-start-start', '-start-end'],
  be: ['-end-start', '-end-end'],
  s: ['-end-start', '-start-start'],
  is: ['-end-start', '-start-start'],
  e: ['-start-end', '-end-end'],
  ie: ['-start-end', '-end-end'],
  ss: ['-start-start'],
  'bs-is': ['-start-start'],
  'is-bs': ['-start-start'],
  se: ['-start-end'],
  'bs-ie': ['-start-end'],
  'ie-bs': ['-start-end'],
  es: ['-end-start'],
  'be-is': ['-end-start'],
  'is-be': ['-end-start'],
  ee: ['-end-end'],
  'be-ie': ['-end-end'],
  'ie-be': ['-end-end'],
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
