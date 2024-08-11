export type AnyPrimitive = string | number | boolean;

export interface JSXClassnameStrings {
  templates: string | null;
  literal: string;
}

/** @domain TypeScript Transform */
export interface JSXMappedAttribute {
  prop: string;
  value: {
    literal: string;
    templates: string | null;
  };
  target: string;
}
