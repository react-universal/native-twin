import type { CompleteStyle } from '@native-twin/css';
import type { ClassNameProps, Primitive, TemplateFunctions } from '../types/styled.types';

/** Converts the tagged template string into a css string */
export function buildCSSString<T>(
  chunks: TemplateStringsArray,
  functions: (Primitive | TemplateFunctions<T & ClassNameProps>)[],
  props: T & ClassNameProps,
) {
  let computedString = chunks
    // Evaluate the chunks from the tagged template
    .map((chunk, i) => {
      return [
        chunk,
        functions[i] instanceof Function
          ? (functions[i] as TemplateFunctions<T>)(props)
          : functions[i],
      ];
    })
    .flat()
    // Convert the objects to string if the result is not a primitive
    .map((chunk) => {
      return typeof chunk === 'object' ? (chunk as Partial<CompleteStyle>) : chunk;
    })
    .join('');
  if (props.className) {
    computedString += ` ${props.className}`;
  }
  if (props.tw) {
    computedString += ` ${props.tw}`;
  }
  return computedString.trim();
}
