import type { OmitUndefined, StyledComponentProps } from '../types/styled.types';

type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T;

type ConfigSchema = Record<string, Record<string, string>>;

export type VariantProps<Component extends (...args: any) => any> = Omit<
  OmitUndefined<Parameters<Component>[0]>,
  'tw' | 'className'
>;

export type VariantsConfig<T = unknown> = T extends ConfigSchema
  ? {
      base?: string;
      variants?: T;
      defaultVariants?: ConfigVariants<T>;
    }
  : never;

export type ConfigVariants<T> = T extends ConfigSchema
  ? {
      [Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | null;
    }
  : unknown;

type VariantsFnProps<T> = T extends ConfigSchema
  ? ConfigVariants<T> & StyledComponentProps
  : StyledComponentProps;

export const createVariants = <T>(config: VariantsConfig<T>) => {
  return (props?: VariantsFnProps<T>) => {
    if (!config || !config?.variants || config.variants == null) {
      let composed = config.base ?? '';
      if (props?.className) {
        composed += `${composed == '' ? '' : ' '}${props.className}`;
      }
      if (props?.tw) {
        composed += `${composed == '' ? '' : ' '}${props.tw}`;
      }
      return composed.trim();
    }
    const { variants, defaultVariants } = config;
    const getVariantClassNames = Object.keys(variants)
      .map((variant: keyof typeof variants) => {
        const variantProp = props?.[variant as keyof typeof props];
        // @ts-expect-error
        const defaultVariantProp = defaultVariants?.[variant];

        if (variantProp === null) return null;

        const variantKey = (falsyToString(variantProp) ||
          falsyToString(defaultVariantProp)) as keyof (typeof variants)[typeof variant];

        return variants[variant]![variantKey];
      })
      .filter(Boolean);
    let composed = config.base ?? '';
    if (getVariantClassNames) {
      composed += `${composed == '' ? '' : ' '}${getVariantClassNames}`;
    }
    if (props?.className) {
      composed += `${composed == '' ? '' : ' '}${props.className}`;
    }
    if (props?.tw) {
      composed += `${composed == '' ? '' : ' '}${props.tw}`;
    }
    return composed.trim();
  };
};

const falsyToString = <T extends unknown>(value: T) =>
  typeof value === 'boolean' ? `${value}` : value === 0 ? '0' : value;
