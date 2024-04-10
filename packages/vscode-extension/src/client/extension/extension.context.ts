import * as Ctx from 'effect/Context';
import * as vscode from 'vscode';

export class ExtensionContext extends Ctx.Tag('vscode/ExtensionCtx')<
  ExtensionContext,
  vscode.ExtensionContext
>() {}
