import * as vscode from 'vscode';
import { clientManager } from './client.manager';

export class CompletionsProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    _document: vscode.TextDocument,
    _position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext,
  ): Promise<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    // const doc = clientManager.fileManager.createDocument(document);
    // console.log('COMPLETION', doc.getText());
    // const jsonDocument = document;
    // const completionList = await jsonService.doComplete(
    //   document,
    //   clientManager.codeConverter.asPosition(position),
    //   jsonDocument
    // );
    // console.log("LIST: ", { jsonDocument, completionList });
    // console.log('LANGS: ', monaco.languages.getLanguages());
    // const worker = await monaco.languages.typescript.getTypeScriptWorker();
    // console.log('WORKER: ', worker);
    // const client = await worker(_document.uri);
    // console.log('CLIENT: ', client);
    // const output = await client.getEmitOutput(_document.fileName);
    // console.log('OUT: ', output);
    return clientManager.protocolConverter.asCompletionResult([]);
  }

  resolveCompletionItem(
    item: vscode.CompletionItem,
    _token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.CompletionItem> {
    return item;
    // return await jsonService
    //   .doResolve(clientManager.codeConverter.asCompletionItem(item))
    //   .then((result: any) =>
    //     clientManager.protocolConverter.asCompletionItem(result)
    //   );
  }
}

export class HoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Hover>;
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context?: vscode.HoverContext | undefined,
  ): vscode.ProviderResult<vscode.VerboseHover>;
  provideHover(
    _document: unknown,
    _position: unknown,
    _token: unknown,
    _context?: unknown,
  ):
    | vscode.Hover
    | Thenable<vscode.Hover | null | undefined>
    | vscode.VerboseHover
    | Thenable<vscode.VerboseHover | null | undefined>
    | null
    | undefined {
    return undefined;
    // const document = clientManager.createDocument(vscodeDocument);
    // const jsonDocument = document;
    // return await jsonService
    //   .doHover(
    //     document,
    //     clientManager.codeConverter.asPosition(position),
    //     jsonDocument
    //   )
    //   .then((hover: any) => {
    //     return clientManager.protocolConverter.asHover(hover)!;
    //   });
  }
}
