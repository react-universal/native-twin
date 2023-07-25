import { clsx } from 'clsx';
import { ClassNamesProp, ClassValue } from '../types/css.types';

const cx = clsx;
type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T;

type ConfigSchema = Record<string, Record<string, ClassValue>>;

export type PropsWithVariants<T> = T extends ConfigSchema ? ConfigVariants<T> : T;

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

const falsyToString = <T extends unknown>(value: T) =>
  typeof value === 'boolean' ? `${value}` : value === 0 ? '0' : value;

export const createVariants = <T>(config: VariantsConfig<T>) => {
  return (props?: PropsWithVariants<T> & ClassNamesProp) => {
    if (!config || !config?.variants || config.variants == null) {
      return cx(config.base, props?.className, props?.tw);
    }
    const { variants, defaultVariants } = config;
    const getVariantClassNames = Object.keys(variants).map(
      (variant: keyof typeof variants) => {
        const variantProp = props?.[variant as keyof typeof props];
        // @ts-expect-error
        const defaultVariantProp = defaultVariants?.[variant];

        if (!variantProp) return null;

        const variantKey = (falsyToString(variantProp) ||
          falsyToString(defaultVariantProp)) as keyof (typeof variants)[typeof variant];

        return variants[variant]![variantKey];
      },
    );

    return cx(config.base, getVariantClassNames, props?.tw, props?.className);
  };
};
