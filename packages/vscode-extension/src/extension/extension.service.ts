import type * as vscode from 'vscode';
import * as Context from 'effect/Context';

export class VscodeContext extends Context.Tag('vscode/ExtensionCtx')<
  VscodeContext,
  vscode.ExtensionContext
>() {}
