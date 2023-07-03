type CSSUnits = 'em' | 'rem' | 'px' | 'cn' | 'vh' | 'vw' | 'deg' | 'ex' | 'in';

export type CSSLengthUnit = {
  [U in CSSUnits]: {
    length: number;
    unit: U;
  };
}[CSSUnits];

type CSSPointerEventKind = 'hover' | 'active' | 'focus';

export type CSSPointerEvent = {
  [U in CSSPointerEventKind]: {
    length: number;
    unit: U;
  };
}[CSSPointerEventKind];
