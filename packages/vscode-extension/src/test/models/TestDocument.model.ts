import * as vscode from 'vscode';

export class TestDocument {
  private _doc: vscode.TextDocument | undefined;
  private _editor: vscode.TextEditor | undefined;
  constructor(readonly uri: vscode.Uri) {}

  private async _getDoc() {
    if (this._doc) {
      return this._doc;
    }
    this._doc = await vscode.workspace.openTextDocument(this.uri);
    return this._doc;
  }
  private async _getEditor(range?: vscode.Range) {
    if (this._editor) {
      return this._editor;
    }
    const doc = await this._getDoc();
    this._editor = await vscode.window.showTextDocument(doc, {
      preview: false,
      selection: range,
    });
    return this._editor;
  }

  async open(range?: vscode.Range) {
    return this._getEditor(range);
  }

  async getDoc() {
    return this._doc;
  }

  moveCursor(location: vscode.Location) {
    return vscode.commands.executeCommand('cursorMove', {
      to: 'right',
      by: 'character',
      value: location.range.end.character,
    });
  }

  async editContent(content: string) {
    const doc = await this._getDoc();
    const editor = await this._getEditor();
    const range = new vscode.Range(
      doc.positionAt(0),
      doc.positionAt(doc.getText().length),
    );
    return editor.edit((eb) => eb.replace(range, content));
  }
}
