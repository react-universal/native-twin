import type { AnyStyle, PartialStyle } from '../css.types';
import { border, borderLike } from './border';
import { background } from './color';
import { cornerValue } from './corners';
import { font, textDecoration } from './font';
import { flex, flexFlow, placeContent } from './layout';
import { shadow } from './shadow';
import { sideValue } from './spaces';
import { transform } from './transform';

interface PropertyParserFn {
  (property: string, value: string): AnyStyle;
}

export const cssDeclarationParser: PropertyParserFn = (property, value) => {
  property = kebab2camel(property);
  if (property === 'border') {
    return border(value);
  }
  if (
    property === 'outline' ||
    property === 'borderTop' ||
    property === 'borderLeft' ||
    property === 'borderRight' ||
    property === 'borderBottom'
  ) {
    return borderLike(property, value);
  }
  // if (property === 'borderWidth' || property === 'borderStyle' || property === 'borderColor') {
  //   return sideValue(
  //     'border',
  //     value,
  //     property.split('border').pop() as '' | 'Width' | 'Style' | 'Color',
  //   );
  // }
  if (property === 'background') {
    return background(value);
  }
  if (property === 'margin' || property === 'padding') {
    return sideValue(property, value, '');
  }

  if (property === 'borderRadius') {
    return cornerValue('border', value, 'Radius');
  }

  if (property === 'font') {
    return font(value);
  }

  if (property === 'textDecoration') {
    return textDecoration(value);
  }

  if (property === 'placeContent') {
    return placeContent(value);
  }

  if (property === 'flex') {
    return flex(value);
  }

  if (property === 'flexFlow') {
    return flexFlow(value);
  }

  if (property === 'transform') {
    return transform(value) as PartialStyle;
  }

  if (property === 'textShadow' || property === 'boxShadow') {
    return shadow(property === 'boxShadow' ? 'shadow' : property, value);
  }
  return {
    [property]: value,
  };
};

function kebab2camel(input: string) {
  return input.replace(/-./g, (x) => x.toUpperCase().charAt(1));
}
