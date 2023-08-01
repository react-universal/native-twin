import {
  TemplateLanguageService,
  TemplateContext,
} from 'typescript-template-language-service-decorator';
import * as ts from 'typescript/lib/tsserverlibrary';

export class EchoTemplateLanguageService implements TemplateLanguageService {
  getCompletionsAtPosition(
    context: TemplateContext,
    position: ts.LineAndCharacter,
  ): ts.CompletionInfo {
    const line = context.text.split(/\n/g)[position.line];
    return {
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
      entries: [
        {
          name: line!.slice(0, position.character),
          kind: ts.ScriptElementKind.variableElement,
          kindModifiers: 'echo',
          sortText: 'echo',
        },
      ],
    };
  }
}
