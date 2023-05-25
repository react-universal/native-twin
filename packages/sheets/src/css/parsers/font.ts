import type { Style } from "../css.types";
import { findNumbers } from "./numbers";

export function textDecoration(value: string) {
  const values = value.split(/\s+/gm);
  const result = {
    textDecorationLine: 'none',
    textDecorationStyle: 'solid',
    textDecorationColor: 'black',
  };
  values.forEach((value) => {
    if (['none', 'solid', 'double', 'dotted', 'dashed'].includes(value))
      result.textDecorationStyle = value;
    else if (['none', 'underline', 'line-through'].includes(value)) {
      // To accept 'underline line-throught' as a value, we need to concatenate
      if (result.textDecorationLine !== 'none') result.textDecorationLine += ' ' + value;
      else result.textDecorationLine = value;
    } else result.textDecorationColor = value;
  });
  return result;
}

export function font (value: string) {
  const { nonNumbers, numbers } = findNumbers(value)
  const result: Style = {
    fontStyle: 'normal',
    fontWeight: 'normal' as string
  }
  for (let i = 0; i < nonNumbers.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const val = nonNumbers.shift()!
    if (val === 'italic') result.fontStyle = val
    else if (val === 'bold') result.fontWeight = val
    else if (val === 'normal') continue// can be both fontStyle or fontWeight, but as it is the default we can just ignore.
    else if (['small-caps', 'oldstyle-nums', 'lining-nums', 'tabular-nums', 'proportional-nums'].includes(val)) result.fontVariant = val
    else {
      nonNumbers.unshift(val)
      break
    }
  }
  // The font family is the last property and can contain spaces
  if (nonNumbers.length > 0) result.fontFamily = nonNumbers.join(' ')

  // The font size is always defined and is the last number
  const size = numbers.pop()
  if (!size) return result
  const [fontSize, lineHeight] = size.split('/') // We can define the line height like this : fontSize/lineHeight
  result.fontSize = fontSize
  if (lineHeight) result.lineHeight = lineHeight
  // The font size is always after the font weight
  if (numbers.length) result.fontWeight = numbers[0]

  return result
}