export type TwinBaseNode<Tag extends string> = {
  readonly _tag: Tag;
};

export interface VariantNode extends TwinBaseNode<'variant'> {
  value: {
    /**
     * Has the util an important `!` symbol
     */
    i: boolean;
    /**
     * The variant name like `md` or `sm` if set, but without `!` and variants
     */
    n: string;
  }[];
}

export interface ColorModifierNode extends TwinBaseNode<'color-mod'> {
  /**
   * Color modifier `/10` or `/[0.5]`
   */
  value: string;
}
export interface ClassNameNode extends TwinBaseNode<'classname'> {
  value: {
    /**
     * Has the util an important `!` symbol
     */
    i: boolean;
    /**
     * The utility name including `-` if set, but without `!` and variants
     */
    n: string;
    /**
     * Has the util a color modifier `bg-red-200/10` or `bg-red-200/[0.5]` symbol
     */
    m: ColorModifierNode | null;
  };
}
export interface VariantClassNode extends TwinBaseNode<'variant-classname'> {
  value: [VariantNode, ClassNameNode];
}
export interface ArbitraryNode extends TwinBaseNode<'arbitrary'> {
  value: string;
}
export interface GroupNode extends TwinBaseNode<'group'> {
  value: {
    /**
     * The group root creator can be:
     * - className based like `bg()` or `text()`
     * - variant based like `md:()` or `sm:()`
     * * Any of them without `:` or `()`
     */
    base: ClassNameNode | VariantNode;
    /**
     * The group content which can be any valid node or another group nested
     * - className based like `bg(blue-200)` or `text(lg blue-200)`
     * - variant based like `md:(bg-blue-200)`
     * - nested like `md:(bg-blue-200 sm:(bg-red-200))`
     * * Any of them without the root node `md:()` or `text()`
     */
    content: (ClassNameNode | GroupNode | VariantClassNode | ArbitraryNode)[];
  };
}

/** @category `Twin Types` */
export interface TwinParsedRule {
  /** The calculated precedence taking all variants into account. */
  readonly p: number;

  /**
   * The utility name including `-` if set, but without `!` and variants
   */
  readonly n: string;

  /**
   * All variants without trailing colon: `hover`, `focus:`
   */
  readonly v: string[];

  /**
   * Has the util an important `!` symbol
   */
  readonly i: boolean;

  /**
   * Has the util a color modifier `bg-red-200/10` or `bg-red-200/[0.5]` symbol
   */
  readonly m: ColorModifierNode | null;
}

export interface TwinClassSegmentNode extends TwinBaseNode<'class-segment'> {
  value: string;
}

export interface ArbitrarySegmentNode extends TwinBaseNode<'arbitrary-segment'> {
  value: string;
}

export interface RuleHandlerToken {
  base: string;
  suffixes: string[];
  segment: TwinClassSegmentNode | ArbitrarySegmentNode;
  negative: boolean;
}

export type TWScreenValueConfig =
  | string
  | { raw: string }
  | { min: string; max?: string }
  | { min?: string; max: string };
