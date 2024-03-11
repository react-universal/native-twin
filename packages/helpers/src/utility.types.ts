/**
 * @description Represents a type that includes `false`, `null`, `undefined`, `void`, and empty string.
 */
export type Falsey = false | null | undefined | void | '';

/**
 * @description Represents a type that could be either single value of type `T` or an array of type `T`.
 */
export type MaybeArray<T> = T | T[];

/**
 * @description Represents a type that is string-like, i.e., it has a `toString` method and it can be used as a string.
 */
export type StringLike = { toString(): string } & string;

/**
 * @description Extracts single item type from an array type, or returns `T` if it's not an array.
 */
export type ArrayType<T> = T extends (infer Item)[] ? Item : T;

/**
 * @experimental
 * @description Transforms a union type into an intersection type.
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

/**
 * @description Represents a type where every property is optional and can be a `DeepPartial` of the original type `T`.
 */
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

/**
 * @description Transforms a string type `S` to its kebab-case variant.
 */
export type KebabCase<S> = S extends `${infer C}${infer T}`
  ? KebabCase<T> extends infer U
    ? U extends string
      ? T extends Uncapitalize<T>
        ? `${Uncapitalize<C>}${U}`
        : `${Uncapitalize<C>}-${U}`
      : never
    : never
  : S;

export interface ColorsRecord {
  [key: string]: (ColorsRecord & { DEFAULT?: string }) | string;
}
