export function placeContent(value: string) {
  const [alignContent, justifyContent = alignContent] = value.split(/\s/g);
  return { alignContent, justifyContent };
}

export function flexFlow(value: string) {
  const values = value.split(/\s/g);
  const result = {} as { [prop: string]: string };
  values.forEach((val) => {
    if (['wrap', 'nowrap', 'wrap-reverse'].includes(val)) result['flexWrap'] = val;
    else if (['row', 'column', 'row-reverse', 'column-reverse'].includes(val))
      result['flexDirection'] = val;
  });
  return result;
}

export function evaluateFlex(value: string) {
  let [flexGrow, flexShrink = '0', flexBasis = '0%'] = value.split(/\s/g);
  if (!flexGrow) flexGrow = '1';
  // If the only property is a not a number, its value is flexBasis. See https://developer.mozilla.org/en-US/docs/Web/CSS/flex
  if (parseFloat(flexGrow) + '' !== flexGrow) return { flexBasis: flexGrow };
  // If the second property is not a number, its value is flexBasis.
  if (parseFloat(flexShrink) + '' !== flexShrink)
    return { flexGrow: flexGrow, flexBasis: flexShrink };
  return {
    flexGrow: flexGrow,
    flexShrink: flexShrink,
    flexBasis,
  };
}
