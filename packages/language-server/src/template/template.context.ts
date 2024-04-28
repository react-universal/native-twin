import * as Context from 'effect/Context';
import * as Option from 'effect/Option';
import ts from 'typescript';
import {
  TemplateContext,
  TemplateSettings,
} from 'typescript-template-language-service-decorator';

// import { Matcher } from '../utils/match';

export interface TemplateSourceHelperServiceShape {
  // helper: StandardScriptSourceHelper;
  // sourceMatchers: Matcher[];
  getTemplateSourceNode: (
    fileName: string,
    position: number,
    text: string,
  ) => Option.Option<
    ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression
  >;
  getTemplateContext: (
    node: Option.Option<
      ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression
    >,
    position: number,
  ) => Option.Option<TemplateContext>;
  getTemplateSettings: () => TemplateSettings;
  getRelativePosition: (
    context: TemplateContext,
    offset: number,
    text: string,
  ) => ts.LineAndCharacter;
}

export class TemplateSourceHelperService extends Context.Tag('ts/template/source-helper')<
  TemplateSourceHelperService,
  TemplateSourceHelperServiceShape
>() {}
