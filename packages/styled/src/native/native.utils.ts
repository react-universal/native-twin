import type { StyledConfiguration } from '../models/Styled.models';

export type Config = {
  source: string;
  target: string[] | string | false;
  nativeStyleMapping?: Record<string, string>;
};

/**
 * Convert the styled() mapping to a config array
 */
export function mappingToConfig(mapping: StyledConfiguration<any>) {
  return Object.entries(mapping).flatMap(([key, value]): Config => {
    if (value === true) return { source: key, target: key };
    else if (value === false) return { source: key, target: false };
    else if (typeof value === 'string') return { source: key, target: value.split('.') };
    else if (typeof value === 'object') {
      const nativeStyleMapping = value.nativeStyleMapping as Record<string, string>;
      if (Array.isArray(value)) {
        value;
        return { source: key, target: value, nativeStyleMapping };
      }

      if ('target' in value) {
        if (value.target === false) {
          return { source: key, target: false, nativeStyleMapping };
        } else if (typeof value.target === 'string') {
          const target = value.target.split('.');

          if (target.length === 1) {
            return { source: key, target: target[0]!, nativeStyleMapping };
          } else {
            return { source: key, target, nativeStyleMapping };
          }
        } else if (Array.isArray(value.target)) {
          return { source: key, target: value.target, nativeStyleMapping };
        }
      }
    }

    throw new Error(`styled(): Invalid mapping for ${key}: ${value}`);
  });
}
