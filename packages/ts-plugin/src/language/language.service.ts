import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import ts from 'typescript/lib/tsserverlibrary';
import { NativeTwinService } from '../native-twin/nativeTwin.service';
import { TemplateSourceHelperService } from '../template/template.context';
import {
  getCompletionEntryDetails,
  getCompletionsAtPosition,
} from './completions/completions.service';
import { getQuickInfoAtPosition } from './hover/hover.service';

export class LanguageProviderService extends Context.Tag('providers/hover')<
  LanguageProviderService,
  {
    getQuickInfoAtPosition: (
      filename: string,
      position: number,
    ) => Effect.Effect<
      Option.Option<ts.QuickInfo>,
      never,
      TemplateSourceHelperService | NativeTwinService
    >;
    getCompletionsAtPosition: (
      filename: string,
      position: number,
    ) => Effect.Effect<
      ts.CompletionEntry[],
      never,
      TemplateSourceHelperService | NativeTwinService
    >;
    getCompletionEntryDetails: (
      fileName: string,
      position: number,
      name: string,
    ) => Effect.Effect<
      Option.Option<ts.CompletionEntryDetails>,
      never,
      NativeTwinService
    >;
  }
>() {}

export const LanguageProviderServiceLive = Layer.scoped(
  LanguageProviderService,
  Effect.sync(() => {
    return {
      getCompletionsAtPosition(filename, position) {
        return getCompletionsAtPosition(filename, position);
      },
      getQuickInfoAtPosition(filename, position) {
        return getQuickInfoAtPosition(filename, position);
      },
      getCompletionEntryDetails(fileName, position, name) {
        return getCompletionEntryDetails(fileName, position, name);
      },
    };
  }),
);
