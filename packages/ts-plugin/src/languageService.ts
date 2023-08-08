import {
  TemplateContext,
  TemplateLanguageService,
} from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import { pluginName } from './constants/config.constants';
import { LanguageServiceContext } from './ServiceContext';

export class TailwindLanguageService implements TemplateLanguageService {
  context: LanguageServiceContext;
  constructor(info: ts.server.PluginCreateInfo) {
    this.context = new LanguageServiceContext(info);
  }
  getCompletionsAtPosition(
    templateContext: TemplateContext,
    position: ts.LineAndCharacter,
  ): ts.WithMetadata<ts.CompletionInfo> {
    const templateClasses = new Set(templateContext.text.split(/\s+/).filter(Boolean));
    this.context.pluginInfo.languageServiceHost.log?.(
      `[${pluginName}] ${[...templateClasses].join(' ')} classes ${position.character}`,
    );

    const entries: ts.CompletionEntry[] = [];
    const isEmptyCompletion = templateContext.text.charAt(position.character - 1) == ' ';
    const prevText = templateContext.text.slice(0, position.character);
    if (prevText.length > 0 && !isEmptyCompletion) {
      const prevClasses = prevText.split(/\s+/).filter(Boolean);
      const completion = prevClasses[prevClasses.length - 1]!;
      this.context.pluginInfo.languageServiceHost.log?.(
        `[${pluginName}] TO_COMPLETED: ${completion}`,
      );
      this.context.completionEntries.forEach((rule) => {
        if (rule.name.includes(completion) && !templateClasses.has(rule.name)) {
          const splitted = rule.name.split(completion);
          entries.push({
            name: rule.name,
            sortText: rule.name,
            insertText: splitted[1] ? splitted[1] : rule.name,
            kind: ts.ScriptElementKind.string,
            labelDetails: { description: rule.description!, detail: rule.detail! },
          });
        }
      });
    } else {
      this.context.completionEntries.forEach((rule) => {
        if (!templateClasses.has(rule.name)) {
          entries.push({
            name: rule.name,
            sortText: rule.name,
            kind: ts.ScriptElementKind.string,
            labelDetails: { description: rule.description!, detail: rule.detail! },
          });
        }
      });
    }

    return {
      entries,
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
    };
  }

  getSemanticDiagnostics(_templateContext: TemplateContext) {
    const diagnostics: ts.Diagnostic[] = [];

    // for (const match of regexExec(/[^:\s]+:?/g, templateContext.text)) {
    //   const className = match[0]!;
    //   const start = match.index;
    //   const length = match![0]!.length;

    //   if (!languageServiceContext.completionEntries.has(className)) {
    //     diagnostics.push({
    //       messageText: `unknown tailwind class or variant "${className}"`,
    //       start: start,
    //       length: length,
    //       file: templateContext.node.getSourceFile(),
    //       category: ts.DiagnosticCategory.Warning,
    //       code: 0, // ???
    //     });
    //   }
    // }

    return diagnostics;
  }
}
