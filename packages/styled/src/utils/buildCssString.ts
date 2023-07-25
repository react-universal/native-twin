import { ClassNamesProp } from '../types/css.types';
import { Primitive, TemplateFunctions } from '../types/styled.types';

/** Converts the tagged template string into a css string */
export function buildCSSString<T extends ClassNamesProp>(
  chunks: TemplateStringsArray,
  functions: (Primitive | TemplateFunctions<T>)[],
  props: T,
) {
  let computedString = chunks
    // Evaluate the chunks from the tagged template
    .map((chunk, i) => [
      chunk,
      functions[i] instanceof Function
        ? (functions[i] as TemplateFunctions<T>)(props)
        : functions[i],
    ])
    .flat()
    // Convert the objects to string if the result is not a primitive
    // .map((chunk) =>
    //   typeof chunk === 'object' ? rnToCSS(chunk as Partial<CompleteStyle>) : chunk,
    // )
    .join('');
  if (props.className) {
    computedString += ` ${props.className}`;
  }
  if (props.tw) {
    computedString += ` ${props.tw}`;
  }
  return computedString;
}
