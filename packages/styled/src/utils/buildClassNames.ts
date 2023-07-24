import { CompleteStyle } from '@universal-labs/css';
import { Primitive, TemplateFunctions } from '../types/styled.types';

/** Converts the tagged template string into a css string */
export function buildClassNames<T extends { className?: string }>(
  chunks: TemplateStringsArray,
  functions: (Primitive | TemplateFunctions<T>)[],
  props: T,
) {
  let computedString = chunks
    // Evaluate the chunks from the tagged template
    .map((chunk, i) => [
      chunk,
      functions[i] instanceof Function
        ? (functions[i] as TemplateFunctions<T>)({
            ...props,
          })
        : functions[i],
    ])
    .flat()
    // Convert the objects to string if the result is not a primitive
    .map((chunk) => {
      return typeof chunk === 'object' ? (chunk as Partial<CompleteStyle>) : chunk;
    })
    .join('');
  if (props.className) computedString += props.className.replace(/=/gm, ':') + '';
  return computedString;
}
