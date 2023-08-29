export interface ClassNameToken {
  readonly type: 'CLASS_NAME';
  readonly variant: boolean;
  readonly variants: string[];
  readonly important: boolean;
  readonly name: string;
  readonly modifiers: any;
}

export interface ClassGroupToken {
  readonly type: 'GROUP';
  readonly important: boolean;
  readonly name: string;
  readonly variant: boolean;
  readonly variants: string[];
  readonly list: (ClassNameToken | ClassGroupToken)[];
}

export interface VariantToken {
  readonly type: 'VARIANT';
  name: string;
  important: boolean;
}

export type RuleToken = ClassNameToken | ClassGroupToken;

export interface ParsedRule {
  /**
   * The utility name including `-` if set, but without `!` and variants
   */
  readonly n: string;

  /**
   * All variants without trailing colon: `hover`, `after:`, `[...]`
   */
  readonly v: string[];

  /**
   * Something like `!underline` or `!bg-red-500` or `!red-500`
   */
  readonly i?: boolean;

  readonly m?: any;
}
