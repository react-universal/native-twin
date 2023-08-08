import type { Logger } from 'typescript-template-language-service-decorator';
import ts from 'typescript/lib/tsserverlibrary';
import { pluginName } from './constants/config.constants';

export class LanguageServiceLogger implements Logger {
  private readonly info: ts.server.PluginCreateInfo;

  constructor(info: ts.server.PluginCreateInfo) {
    this.info = info;
  }

  log(message: string): void {
    this.info.project.projectService.logger.info(`[${pluginName}] ${message}`);
  }
}
