import type { CompleteStyle } from '@universal-labs/css';
import type { Primitive, TemplateFunctions } from '../types/styled.types';

/** Converts the tagged template string into a css string */
export function buildCSSString<T>(
  chunks: TemplateStringsArray,
  functions: (Primitive | TemplateFunctions<T & { className?: string; tw?: string }>)[],
  props: T & { className?: string; tw?: string },
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
  return computedString;
}
