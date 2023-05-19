import { Dimensions } from 'react-native';
import camelize from 'fbjs/lib/camelize';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

/*
  CSS ABSOLUTE UNITS
  https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units
  mm: 3.78px
  cm: 37.8px
  in: 96px
  pt: 1.33px
  pc: 16px
  px: 1px
*/

/*
  CSS RELATIVE UNITS
  https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units
  em: 16px -> :root base
  rem: 16px -> :root base
  ex: NOT_IMPLEMENTED -> not supported -> fallback to px
  ch: NOT_IMPLEMENTED -> not supported -> fallback to px
  vw: SCREEN DIMENSIONS WIDTH -> viewport width TODO: implement size change listener
  vh: SCREEN DIMENSIONS HEIGHT -> viewport height TODO: implement size change listener
  vmin: SCREEN DIMENSIONS MIN -> viewport min between width and height TODO: implement size change listener
  vmax: SCREEN DIMENSIONS MAX -> viewport max between width and height TODO: implement size change listener
  %: RELATIVE TO PARENT ELEMENT
*/

export const tokenizeDeclarations = (css: string) => {
  const declarations = css.split(';');
  const validDeclarations: any[] = [];
  const variables: Record<string, string> = {};
  for (const current of declarations) {
    const splitted = current.split(':');
    const declaration = {
      property: splitted[0],
      value: splitted[1],
    };
    if (!declaration.property || !declaration.value) {
      continue;
    }
    if (declaration.property.startsWith('--')) {
      variables[declaration.property] = declaration.value;
    } else {
      const newValue = declaration.value.replace(/var\((--[\w-]+)\)/g, (match, p1) =>
        p1 in variables ? variables[p1]! : match,
      );
      const newProperty = getStylePropertyName(declaration.property);
      const value = getStylePropertyValue(newValue);
      validDeclarations.push({ property: newProperty, value });
    }
  }
  return validDeclarations;
};

const getStylePropertyName = (property: string) => {
  return camelize(property);
};

const getDeclarationLetters = /\/*[A-Za-z]+/;
const getDeclarationValue = /(\d+(?:.\d+)?)([a-zA-Z]+)/;
const remDeclarationMatcher = /("[^"]+"|'[^']+'|url\([^)]+\)|(-?\d*\.?\d+))[rem,em]/g;
// /(([\d][?.][?\d]+)|([\d])+)*([?\w]*)+/m;
/*
  Declaration value can starts with:
  - number
  - number with decimal
  - number with decimal and unit  
*/
const getStylePropertyValue = (value: string) => {
  const matchRem = value.match(remDeclarationMatcher);
  const matchLetters = value.match(getDeclarationLetters);
  const match = value.match(getDeclarationValue);
  if (match) {
    if (match[2] === 'px') {
      const unitValue = match[1];
      if (unitValue) {
        return parseFloat(unitValue) as any as string;
      } else {
        console.warn(`PX WITHOUT VALUE at ${value} received: ${unitValue}`);
      }
    }

    if (match[2] === 'rem' || match[2] === 'em') {
      const unitValue = match[1];
      if (unitValue) {
        return (parseFloat(unitValue) * 16) as any as string;
      } else {
        console.warn(`REM OR EM WITHOUT VALUE at ${value}`);
      }
    }

    if (match[2] === 'vh') {
      const unitValue = match[1];
      if (unitValue) {
        return (SCREEN_HEIGHT * (Number(unitValue) / 100)) as any as string;
      } else {
        console.warn(`VH WITHOUT VALUE at ${value}`);
      }
    }

    if (match[2] === 'vw') {
      const unitValue = match[1];
      if (unitValue) {
        return (SCREEN_WIDTH * (Number(unitValue) / 100)) as any as string;
      } else {
        console.warn(`VW WITHOUT VALUE at ${value}`);
      }
    }
  }
  return value;
};
