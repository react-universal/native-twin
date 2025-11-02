import type { Rule, RuleResolver, Variant, VariantResolver } from '@native-twin/core';
import * as Data from 'effect/Data';
import type { InternalTwinConfig } from '../../models/twin/native-twin.types';

export namespace TwinDslModels {
  export type TwinVariantNode = Data.TaggedEnum<{
    Literal: { pattern: Variant[0]; value: string };
    Resolver: { pattern: Variant[0]; value: VariantResolver };
  }>;
  export type TwinRuleNode = Data.TaggedEnum<{
    ThemedKey: {
      pattern: string;
      themeSection: keyof Omit<
        InternalTwinConfig['theme'] & InternalTwinConfig['theme']['extend'],
        'screens'
      >;
      resolver: RuleResolver;
      meta: NonNullable<Rule[3]>;
    };
    UnKeyed: {
      pattern: string;
      resolver: RuleResolver;
      meta: NonNullable<Rule[3]>;
    };
  }>;

  // export interface TwinVariantNode extends Data.TaggedEnum.WithGenerics<1> {
  //   readonly taggedEnum: TwinVariantNodeShape;
  // }

  export const TwinVariantNode = Data.taggedEnum<TwinDslModels.TwinVariantNode>();

  export const TwinRuleNode = Data.taggedEnum<TwinDslModels.TwinRuleNode>();
}
