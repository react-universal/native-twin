import ts from 'typescript/lib/tsserverlibrary';
import { Suggestion } from './types';
import { StandardTemplateSourceHelper } from './source-helper';
import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import { ConfigurationManager } from './configuration';
import { LanguageServiceLogger } from './logger';

export class LanguageServiceContext {
  completionEntries = new Map<string, Suggestion>();
  pluginInfo: ts.server.PluginCreateInfo;
  templateSourceHelper: StandardTemplateSourceHelper;
  typescript: typeof ts;
  configManager: ConfigurationManager;
  logger: LanguageServiceLogger;
  constructor(
    typescript: typeof ts,
    info: ts.server.PluginCreateInfo,
    config: ConfigurationManager,
  ) {
    this.pluginInfo = info;
    this.typescript = typescript;
    this.configManager = config;
    this.logger = new LanguageServiceLogger(info);
    this.templateSourceHelper = new StandardTemplateSourceHelper(
      this.typescript,
      this.configManager,
      new StandardScriptSourceHelper(this.typescript, this.pluginInfo.project),
    );
  }
}
