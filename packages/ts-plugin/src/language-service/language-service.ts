import {
  TemplateContext,
  TemplateLanguageService,
} from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import { inspect } from 'util';
import { LanguageServiceLogger } from './logger';
import { parse } from './parser';

function getCompletionsAtPosition(
  context: TemplateContext,
  position: ts.LineAndCharacter,
  logger: LanguageServiceLogger,
): ts.WithMetadata<ts.CompletionInfo> {
  const text = context.text;
  const textOffset = context.toOffset(position);
  const ruleTokens = parse(text, textOffset);
  if (ruleTokens.isError) {
    logger.log(`Error: ${inspect(ruleTokens.error)}`);
  }
  if (!ruleTokens.isError) {
    logger.log(`VALID: ${inspect(ruleTokens.result)}`);
  }

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
