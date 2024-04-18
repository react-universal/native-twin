import * as Context from 'effect/Context';
import * as Option from 'effect/Option';
import ts from 'typescript';
import {
  TemplateContext,
  TemplateSettings,
} from 'typescript-template-language-service-decorator';
import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import { Matcher } from '../utils/match';

export class TemplateSourceHelperService extends Context.Tag('ts/template/source-helper')<
  TemplateSourceHelperService,
  {
    helper: StandardScriptSourceHelper;
    sourceMatchers: Matcher[];
    getTemplateNode: (
      fileName: string,
      position: number,
    ) => Option.Option<
      ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression
    >;
    getTemplateContext: (
      fileName: string,
      node: Option.Option<
        ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression
      >,
    ) => Option.Option<TemplateContext>;
    getTemplateSettings: () => TemplateSettings;
    getRelativePosition: (
      context: TemplateContext,
      offset: number,
    ) => ts.LineAndCharacter;
  }
>() {}
