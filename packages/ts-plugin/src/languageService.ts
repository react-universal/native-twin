import {
  TemplateContext,
  TemplateLanguageService,
} from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import { pluginName } from './constants/config.constants';
import { ConfigurationManager } from './configuration';
import { LanguageServiceLogger } from './logger';
import { StandardTemplateSourceHelper } from './source-helper';
import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import { CreateIntellisenseFn } from './intellisense/extractUserTheme';
import * as vscode from 'vscode-languageserver-types';

export class TailwindLanguageService implements TemplateLanguageService {
  configManager: ConfigurationManager;
  logger: LanguageServiceLogger;
  templateSourceHelper: StandardTemplateSourceHelper;
  pluginInfo: ts.server.PluginCreateInfo;
  intellisense: CreateIntellisenseFn;
  constructor(
    typescript: typeof ts,
    info: ts.server.PluginCreateInfo,
    configManager: ConfigurationManager,
    intellisense: CreateIntellisenseFn,
  ) {
    this.intellisense = intellisense;
    this.configManager = configManager;
    this.logger = new LanguageServiceLogger(info);
    this.pluginInfo = info;
    this.templateSourceHelper = new StandardTemplateSourceHelper(
      typescript,
      configManager,
      new StandardScriptSourceHelper(typescript, info.project),
    );
  }
  getCompletionsAtPosition(
    templateContext: TemplateContext,
    position: ts.LineAndCharacter,
  ): ts.WithMetadata<ts.CompletionInfo> {
    const templateClasses = new Set(templateContext.text.split(/\s+/).filter(Boolean));
    this.pluginInfo.languageServiceHost.log?.(
      `[${pluginName}] ${[...templateClasses].join(' ')} classes ${position.character}`,
    );
    // const isEmptyCompletion = templateContext.text.charAt(position.character - 1) == ' ';
    // const prevText = templateContext.text.slice(0, position.character);
    const entries = Array.from(this.intellisense.cache.entries()).map(
      (item): ts.CompletionEntry => {
        return {
          kind: ts.ScriptElementKind.string,
          name: item[0],
          sortText: item[0],
          hasAction: true,
        };
      },
    );

    return {
      entries,
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
    };
  }
  getCompletionEntryDetails(
    context: TemplateContext,
    position: ts.LineAndCharacter,
    name: string,
  ): ts.CompletionEntryDetails {
    return {
      name: name,
      kind: ts.ScriptElementKind.primitiveType,
      kindModifiers: '',
      tags: [],
      displayParts: [],
      documentation: [
        {
          kind: vscode.MarkupKind.Markdown,
          text: getDocumentation(this.intellisense.cache.get(name)),
        },
      ],
    };
  }
}
function getDocumentation(
  data: ReturnType<TailwindLanguageService['intellisense']['cache']['get']>,
) {
  if (!data) return '';
  const result: string[] = [];
  result.push('### Css Rules \n\n');
  result.push(`${'```css\n'}${data.css}${'\n```'}`);
  result.push('\n\n');
  result.push('### React Native StyleSheet \n\n');
  result.push(`${'```json\n'}${JSON.stringify(data.sheet, null, 2)}${'\n```'}`);
  return result.join('\n\n');
}
