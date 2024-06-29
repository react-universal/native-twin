import * as vscode from 'vscode';
import * as monaco from 'monaco-editor';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  RegisteredMemoryFile,
  registerFileSystemOverlay,
  RegisteredFileSystemProvider,
} from '@codingame/monaco-vscode-files-service-override';
import type { IStoredWorkspace } from '@codingame/monaco-vscode-configuration-service-override';

export class FileManager {
  focusDocument: vscode.TextDocument | undefined;
  readonly workspaceFile = monaco.Uri.file('/workspace.code-workspace');
  readonly rootPath = '/workspace';
  readonly fileSystemProvider = new RegisteredFileSystemProvider(false);
  readonly languageId = 'typescript';

  createFile(name: string, content: string) {
    const file = new RegisteredMemoryFile(
      vscode.Uri.file(`${this.rootPath}/${name}`).with({ scheme: 'typescript' }),
      content,
    );
    this.fileSystemProvider.registerFile(file);
    return file;
  }

  fileToURI(name: string) {
    return vscode.Uri.file(`${this.rootPath}/${name}`);
  }

  createModel(fileContents: string, fileName: string) {
    monaco.editor.createModel(fileContents, this.languageId, this.fileToURI(fileName));
  }

  createDocument(vscodeDocument: vscode.TextDocument) {
    return TextDocument.create(
      vscodeDocument.uri.toString(),
      vscodeDocument.languageId,
      vscodeDocument.version,
      vscodeDocument.getText(),
    );
  }

  setup() {
    this.fileSystemProvider.registerFile(
      new RegisteredMemoryFile(
        this.workspaceFile,
        JSON.stringify(<IStoredWorkspace>{
          folders: [
            {
              path: '/workspace',
            },
          ],
        }),
      ),
    );

    registerFileSystemOverlay(1, this.fileSystemProvider);

    vscode.workspace.onDidOpenTextDocument((_event) => {
      this.focusDocument = _event;
    });
  }
}
