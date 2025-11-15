import type { NodePath } from '@babel/core';
import type * as t from '@babel/types';
import type * as Option from 'effect/Option';

export interface BabelLanguageRegionData {
  location: Option.Option<t.SourceLocation>;
  path:
    | NodePath<t.CallExpression>
    | NodePath<t.TaggedTemplateExpression>
    | NodePath<t.JSXAttribute>;
}
