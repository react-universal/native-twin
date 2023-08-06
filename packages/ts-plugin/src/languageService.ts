import { TemplateLanguageService } from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import { pluginName } from './constants/config.constants';
import { Suggestion } from './createIntellisense';

export type LanguageServiceContext = {
  completionEntries: Map<string, Suggestion>;
};

export function createLanguageService(
  languageServiceContext: LanguageServiceContext,
  info: ts.server.PluginCreateInfo,
): TemplateLanguageService {
  return {
    getCompletionsAtPosition(templateContext) {
      const templateClasses = new Set(templateContext.text.split(/\s+/).filter(Boolean));
      info.languageServiceHost.log?.(
        `[${pluginName}] ${[...templateClasses].join('--')} classes9`,
      );

      const entries: ts.CompletionEntry[] = [];
      info.project.projectService.logger.info(
        `[${pluginName}] ${[...templateClasses].join('--')} classes`,
      );

      info.project.projectService.logger.info(`[${pluginName}] text ${templateContext.text}`);

      languageServiceContext.completionEntries.forEach((rule) => {
        if (!templateClasses.has(rule.name)) {
          entries.push({
            name: rule.name,
            sortText: rule.name,
            kind: ts.ScriptElementKind.string,
            labelDetails: { description: rule.description!, detail: rule.detail! },
          });
        }
      });

      return {
        entries,
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
      };
    },

    getSemanticDiagnostics(_templateContext) {
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
    },
  };
}
