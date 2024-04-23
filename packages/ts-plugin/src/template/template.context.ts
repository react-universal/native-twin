import * as Context from 'effect/Context';
import * as Option from 'effect/Option';
import ts from 'typescript';
import {
  TemplateContext,
  TemplateSettings,
} from 'typescript-template-language-service-decorator';
import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import { Matcher } from '../utils/match';
import { TemplateTokenWithText } from './template.types';

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
      node: Option.Option<
        ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression
      >,
      position: number,
    ) => Option.Option<TemplateContext>;
    getTemplateSettings: () => TemplateSettings;
    getRelativePosition: (
      context: TemplateContext,
      offset: number,
    ) => ts.LineAndCharacter;
  }
>() {}

export interface TemplateNodeShape {
  readonly node:
    | ts.StringLiteral
    | ts.NoSubstitutionTemplateLiteral
    | ts.TemplateExpression;
  readonly cursorPosition: number;
  readonly templateContext: TemplateContext;
  readonly parsedTemplate: TemplateTokenWithText[];
  readonly positions: {
    relative: {
      position: ts.LineAndCharacter;
      offset: number;
    };
    document: {
      start: number;
      end: number;
    };
  };

  getTokenAtPosition(offset: number): TemplateTokenWithText[];
}

export class TemplateNodeService extends Context.Tag('TemplateNodeService')<
  TemplateNodeService,
  TemplateNodeShape
>() {}
