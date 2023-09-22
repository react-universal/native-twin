import type { Logger } from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import { ConfigurationManager } from './configuration';

export class LanguageServiceLogger implements Logger {
  private readonly info: ts.server.PluginCreateInfo;

  constructor(info: ts.server.PluginCreateInfo) {
    this.info = info;
  }

  log(message: string): void {
    this.info.project.projectService.logger.info(
      `[${ConfigurationManager.pluginName}]: ${message}`,
    );
  }
}
