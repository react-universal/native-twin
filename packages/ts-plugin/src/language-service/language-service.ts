import {
  TemplateContext,
  TemplateLanguageService,
} from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import { inspect } from 'util';
import { ConfigurationManager } from './configuration';
import { LanguageServiceLogger } from './logger';

function getCompletionsAtPosition(
  context: TemplateContext,
  position: ts.LineAndCharacter,
  logger: LanguageServiceLogger,
): ts.WithMetadata<ts.CompletionInfo> {
  const text = context.text;
  const textOffset = context.toOffset(position);
  logger.log(
    `${ConfigurationManager.pluginName}: ${inspect({
      text,
      textOffset,
    })}`,
  );
  return {
    entries: [],
    isGlobalCompletion: false,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  };
}

export class NativeTailwindLanguageService implements TemplateLanguageService {
  constructor(private _logger: LanguageServiceLogger) {}
  getCompletionsAtPosition(
    context: TemplateContext,
    position: ts.LineAndCharacter,
  ): ts.WithMetadata<ts.CompletionInfo> {
    return getCompletionsAtPosition(context, position, this._logger);
  }
}
