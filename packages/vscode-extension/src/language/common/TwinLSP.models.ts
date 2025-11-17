import type * as vscode from 'vscode';

export interface VscodeWorkspace {
  folder: vscode.WorkspaceFolder;
  twinPath: string;
  isRoot: boolean;
}
