import { globalKeywords } from '../../utils/mappings';

export const verticalAlign = {
  mid: 'middle',
  base: 'baseline',
  btm: 'bottom',
  baseline: 'baseline',
  top: 'top',
  start: 'top',
  middle: 'middle',
  bottom: 'bottom',
  end: 'bottom',
  'text-top': 'text-top',
  'text-bottom': 'text-bottom',
  sub: 'sub',
  super: 'super',
  ...Object.fromEntries(globalKeywords.map((x) => [x, x])),
};

export const textAlign = {
  center: 'center',
  left: 'left',
  right: 'right',
  justify: 'justify',
  start: 'start',
  end: 'end',
};
