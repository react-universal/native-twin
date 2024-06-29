import * as Option from 'effect/Option';
import type * as vscode from 'vscode';
import {
  DEFAULT_PLUGIN_CONFIG,
  NativeTwinPluginConfiguration,
} from '../utils/constants.utils';

export class ConfigManagerService {
  tsconfig: Option.Option<vscode.Uri> = Option.none();
  twinConfigFile: Option.Option<vscode.Uri> = Option.none();
  workspaceRoot: Option.Option<vscode.WorkspaceFolder> = Option.none();
  config: NativeTwinPluginConfiguration = DEFAULT_PLUGIN_CONFIG;
  constructor(config: {
    readonly tsconfig: Option.Option<vscode.Uri>;
    readonly twinConfigFile: Option.Option<vscode.Uri>;
    readonly workspaceRoot: Option.Option<vscode.WorkspaceFolder>;
    readonly config: NativeTwinPluginConfiguration;
  }) {
    this.config = config.config;
    this.tsconfig = config.tsconfig;
    this.twinConfigFile = config.twinConfigFile;
    this.workspaceRoot = config.workspaceRoot;
  }

  onUpdateConfig(config: {
    readonly tsconfig: Option.Option<vscode.Uri>;
    readonly twinConfigFile: Option.Option<vscode.Uri>;
    readonly workspaceRoot: Option.Option<vscode.WorkspaceFolder>;
    readonly config: NativeTwinPluginConfiguration;
  }) {
    this.config = config.config;
    this.tsconfig = config.tsconfig;
    this.twinConfigFile = config.twinConfigFile;
    this.workspaceRoot = config.workspaceRoot;
  }
}
